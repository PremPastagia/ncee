import requests
from bs4 import BeautifulSoup
import json
import sys

def scrape_necc(month="03", year="2026", report_type="Daily Rate Sheet"):
    url = "https://e2necc.com/home/eggprice"
    payload = {
        "ddlMonth": month,
        "ddlYear": year,
        "rblReportType": report_type,
        "__EVENTTARGET": "",
        "__EVENTARGUMENT": "",
    }
    
    try:
        # First GET to get viewstate if needed (ASP.NET sites often need it)
        s = requests.Session()
        r1 = s.get(url)
        soup1 = BeautifulSoup(r1.text, 'html.parser')
        
        # Extract ASP.NET hidden fields
        for hidden in soup1.find_all("input", type="hidden"):
            payload[hidden.get("name")] = hidden.get("value")
            
        # Now POST to get the actual data
        response = s.post(url, data=payload, timeout=15)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        tables = soup.find_all('table')
        data = []
        for table in tables:
            rows = table.find_all('tr')
            for row in rows:
                cols = row.find_all(['td', 'th'])
                cols_text = [ele.text.strip() for ele in cols]
                if cols_text:
                    data.append(cols_text)
        return data
    except Exception as e:
        return {"error": str(e)}

def clean_data(raw_data):
    if isinstance(raw_data, dict) and "error" in raw_data:
        return raw_data

    if not isinstance(raw_data, list):
        return {"error": "Unexpected data format"}

    cities_data = []
    for row in raw_data:
        if len(row) > 30 and row[0] not in ["Name Of Zone / Day", "NECC SUGGESTED EGG PRICES"]:
            city = row[0]
            prices = [p for p in row[1:32] if p not in ["-", ""]]
            latest_price = float(prices[-1]) / 100 if prices else 0
            avg_price = float(row[-1]) / 100 if row[-1] not in ["-", ""] else 0
            
            cities_data.append({
                "city": city.replace("(CC)", "").replace("(OD)", "").replace("(WB)", "").strip(),
                "price": latest_price or avg_price,
                "avg": avg_price
            })
    return cities_data


def clean_data_full(raw_data, month, year):
    """Return full daily price arrays for each city — used by Trends, Forecast, Market Analysis, Risk Analysis."""
    if isinstance(raw_data, dict) and "error" in raw_data:
        return raw_data

    if not isinstance(raw_data, list):
        return {"error": "Unexpected data format"}

    cities_data = []
    for row in raw_data:
        if len(row) > 30 and row[0] not in ["Name Of Zone / Day", "NECC SUGGESTED EGG PRICES"]:
            city = row[0].replace("(CC)", "").replace("(OD)", "").replace("(WB)", "").strip()
            
            # Extract all daily prices (day 1 to 31), converting paise to rupees
            daily_prices = []
            for day_idx in range(1, 32):
                if day_idx < len(row):
                    val = row[day_idx]
                    if val not in ["-", "", " "]:
                        try:
                            daily_prices.append({
                                "day": day_idx,
                                "date": f"{year}-{month}-{str(day_idx).zfill(2)}",
                                "price": round(float(val) / 100, 2)
                            })
                        except ValueError:
                            pass
            
            avg_price = 0
            try:
                if row[-1] not in ["-", ""]:
                    avg_price = round(float(row[-1]) / 100, 2)
            except ValueError:
                pass
            
            latest_price = daily_prices[-1]["price"] if daily_prices else avg_price
            
            cities_data.append({
                "city": city,
                "price": latest_price,
                "avg": avg_price,
                "dailyPrices": daily_prices
            })
    return cities_data


if __name__ == "__main__":
    m = sys.argv[1] if len(sys.argv) > 1 else "03"
    y = sys.argv[2] if len(sys.argv) > 2 else "2026"
    t = sys.argv[3] if len(sys.argv) > 3 else "Daily Rate Sheet"
    fmt = sys.argv[4] if len(sys.argv) > 4 else "simple"
    
    raw = scrape_necc(m, y, t)
    if fmt == "full":
        cleaned = clean_data_full(raw, m, y)
    else:
        cleaned = clean_data(raw)
    print(json.dumps(cleaned))
