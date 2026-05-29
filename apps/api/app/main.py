import os
import json
import logging
import subprocess
from pathlib import Path
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Set up logging to trace errors in docker logs
logger = logging.getLogger("uvicorn.error")

app = FastAPI()

# Enable CORS for your Next.js Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_ROOT = Path(os.getenv("DATA_ROOT", "/data"))


# ==========================================
# NIGHTLY SCHEDULER (Kept intact from earlier)
# ==========================================
def run_nightly_pipeline():
    print("🌙 [2:00 AM] Commencing Nightly Quantly Data Extraction...")
    try:
        subprocess.run(["python", "-m", "app.scripts.backfill_macro"])
        print("-> 🧠 Running LLM Sentiment Analysis...")
        subprocess.run(["python", "-m", "app.scripts.backfill_sentiment"])
        # Add your other cron scripts here (prices, insiders, zscore)
    except Exception as e:
        logger.error(f"Nightly pipeline failed: {e}")


# ==========================================
# API ENDPOINTS
# ==========================================

@app.get("/api/screener")
def get_screener_data():
    """Serves the master universe of calculated Z-Scores and Fundamentals."""
    screener_file = DATA_ROOT / "latest_screener.json"
    
    if screener_file.exists():
        try:
            with open(screener_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error serving screener master file: {e}")
            return []
            
    return []


@app.get("/api/stock/{ticker}")
def get_single_stock(ticker: str):
    # 1. Initialize default/fallback response structures
    stats = {
        "symbol": ticker, "sector": "Unknown", "total_assets": 0, "total_liabilities": 0,
        "net_income": 0, "revenue": 0, "eps": 0, "operating_cash_flow": 0,
        "latest_price": 0, "market_cap": 0, "Z-Score": 0, "Relative_Score": 0,
        "strong_cash_flow": False, "net_insider_flow": 0
    }
    chart_data = []
    regime_data = {"regime_label": "Unknown (No Data)", "pca_confidence": 0, "cluster_id": -1}
    nowcast_data = {"prediction": 0, "trend": "Stable", "confidence": 0, "shap_base": 0, "shap_values": {}}

    # 2. Load Real Fundamental Data from the Screener JSON safely
    screener_file = DATA_ROOT / "latest_screener.json"
    if screener_file.exists():
        try:
            with open(screener_file, 'r') as f:
                universe = json.load(f)
                for stock in universe:
                    if stock.get("symbol") == ticker:
                        # Merge found stats with our default structure
                        stats.update(stock)
                        break
        except Exception as e:
            logger.error(f"Error reading screener JSON: {e}")

    # 3. Load Real Price History from the Parquet Data Lake safely
    price_file = DATA_ROOT / "prices" / "daily" / f"symbol={ticker}" / "prices.parquet"
    
    if price_file.exists():
        try:
            df = pd.read_parquet(price_file)
            
            if not df.empty and len(df) > 5:
                # Sanitize column names to lowercase and handle index variations
                df.columns = [str(c).lower() for c in df.columns]
                if 'date' not in df.columns:
                    df = df.reset_index()
                    df.columns = [str(c).lower() for c in df.columns]
                    if 'index' in df.columns and 'date' not in df.columns:
                        df = df.rename(columns={'index': 'date'})

                # Update the latest price from the data lake if available
                if 'close' in df.columns:
                    stats["latest_price"] = round(float(df['close'].iloc[-1]), 2)
                elif 'price' in df.columns:
                    stats["latest_price"] = round(float(df['price'].iloc[-1]), 2)

                # 4. RUN THE MACHINE LEARNING MODELS WITH INDIVIDUAL SAFETY NETS
                from app.ml.anomaly import detect_price_anomalies
                from app.ml.regime import detect_market_regime
                from app.ml.nowcast import predict_current_cash_flow

                # Anomaly Model Safety
                try:
                    anomalies = detect_price_anomalies(df.tail(250))
                    for _, row in anomalies.iterrows():
                        raw_date = row.get('date')
                        date_str = raw_date.strftime('%Y-%m-%d') if hasattr(raw_date, 'strftime') else str(raw_date)
                        chart_data.append({
                            "date": date_str,
                            "price": round(float(row.get('close', row.get('price', 0))), 2),
                            "isAnomaly": bool(row.get('anomaly', 1) == -1 or row.get('isanomaly', False))
                        })
                except Exception as am_err:
                    logger.error(f"Anomaly model failed for {ticker}: {am_err}")
                    # Fallback plain chart formatting without anomaly flags
                    for _, row in df.tail(100).iterrows():
                        raw_date = row.get('date')
                        date_str = raw_date.strftime('%Y-%m-%d') if hasattr(raw_date, 'strftime') else str(raw_date)
                        chart_data.append({
                            "date": date_str,
                            "price": round(float(row.get('close', row.get('price', 0))), 2),
                            "isAnomaly": False
                        })

                # Regime Model Safety
                try:
                    regime_data = detect_market_regime(df.tail(250))
                except Exception as rm_err:
                    logger.error(f"Regime model failed for {ticker}: {rm_err}")

                # Nowcast Model Safety
                try:
                    last_cf = float(stats.get("operating_cash_flow", 0))
                    nowcast_data = predict_current_cash_flow(df.tail(250), last_cf)
                except Exception as nc_err:
                    logger.error(f"Nowcast model failed for {ticker}: {nc_err}")
                    nowcast_data = {"prediction": last_cf, "trend": "Stable", "confidence": 0, "shap_base": last_cf, "shap_values": {}}

        except Exception as e:
            logger.error(f"Global Parquet processing error for {ticker}: {e}")

    return {
        "ticker": ticker,
        "stats": stats,
        "chart": chart_data,
        "anomaly_count": len([d for d in chart_data if d.get("isAnomaly")]),
        "regime": regime_data,
        "nowcast": nowcast_data
    }