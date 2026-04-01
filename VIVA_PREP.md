This document contains possible questions your external examiner or professor might ask during your viva. Since they know you utilized AI tools, the focus will likely be on **understanding the logic, the math, and the architecture**, rather than just syntax.

---

## 📌 Section 1: Project Overview & Problem Statement
**Q1: What is the core objective of this project?**
> **Answer:** The project aims to build a comprehensive analytics platform for the Indian Egg Market (NECC). It focuses on three things:
> 1. **Data Collection:** Scraping daily prices from e2necc.com.
> 2. **Market Integration Analysis:** Understanding how prices in production centers (e.g., Namakkal) influence consumption centers (e.g., Delhi).
> 3. **Risk & Volatility Assessment:** Detecting price shocks and measuring market stability using statistical models.

**Q2: Why did you choose "Egg Market" specifically?**
> **Answer:** Eggs are a high-frequency commodity (daily prices). Unlike other crops, they have defined production zones (Namakkal, Barwala) and consumption zones (Cities). This makes them perfect for studying **Spatial Price Dispersion** (how distance affects price) and **Market Efficiency**.

**Q3: What technologies are used in this stack?**
> **Answer:**
> *   **Frontend:** React.js with Vite (for fast rendering and interactive charts).
> *   **Backend:** Node.js (Express server) acting as a gateway.
> *   **Data Engine:** Python (BeautifulSoup) for scraping, because Python libraries are superior for parsing HTML tables.
> *   **Communication:** The Node server spawns a Python child process to fetch data on demand.

---

## 📌 Section 2: Architecture & Technical Implementation
**Q4: How does the Data Fetching work flow?**
> **Answer:**
> 1.  The frontend calls `/api/egg-prices` via the Vite proxy.
> 2.  The Node.js server (`server.js`) receives this request.
> 3.  Node executes the python script: `spawn('python', ['scrape_data.py'])`.
> 4.  The Python script scrapes e2necc.com, parses the table, and prints JSON to `stdout`.
> 5.  Node captures this JSON and sends it back to the React frontend.

**Q5: Why did you need a `proxy` in `vite.config.js`?**
> **Answer:** The React app runs on port `5173` (development), while the Backend runs on `3001`. A proxy is needed to forward API requests from the frontend to the backend to avoid **CORS (Cross-Origin Resource Sharing)** issues and to make the API calls look local (relative paths).

**Q6: Why use SVG for charts instead of a library like Chart.js?**
> **Answer:** We built custom SVG components (in `MarketAnalysisCharts.jsx` and `RiskAnalysisCharts.jsx`) to have **granular control** over the visualization logic—like coloring specific zones in the Z-Score chart or creating a custom correlation gauge—which is harder to customize in pre-built libraries.

---

## 📌 Section 3: Market Analysis (Statistics & Math)
**Q7: What is "Spatial Price Dispersion"?**
> **Answer:** It is the difference in price between two separated markets. Mathematically, we calculate it as `| P_producer - P_consumer |`.
> *   **Low dispersion** means markets are well-connected (efficient transport).
> *   **High dispersion** implies bottlenecks or supply chain inefficiencies.

**Q8: How do you measure "Market Integration"?**
> **Answer:** We use two key metrics:
> 1.  **Correlation Coefficient (r):** A value between -1 and +1. If $r > 0.8$, price changes in Namakkal strongly predict price changes in Delhi.
> 2.  **Linear Regression (Beta β):** We fit a line `P_consumer = α + β * P_producer`. The slope ($\beta$) tells us "Price Transmission"—if prices rise ₹1 in the producer state, how much do they rise in the consumer state?

**Q9: What does the "Coefficient of Variation" (CV) tell us that Variance doesn't?**
> **Answer:** Variance is an absolute number (e.g., 0.5). It's hard to compare variance between a cheap item and an expensive item.
> **CV** is a percentage: $CV = (\sigma / \mu) \times 100$.
> It allows us to say "This market has 5% volatility," which makes it comparable across different states regardless of their base price.

---

## 📌 Section 4: Risk Analysis & Shock Detection
**Q10: Explain your "Z-Score" Shock Detection method.**
> **Answer:** The Z-score tells us how many standard deviations a price is from the mean.
> *   Formula: $Z = (Price - Mean) / StdDev$
> *   **Logic:** In a normal distribution, 95% of data is within 2 standard deviations.
> *   **Implementation:** We flag any day with $|Z| > 2$ as a "Moderate Shock" and $|Z| > 3$ as a "Severe Shock."

**Q11: What is the difference between specific "Downside Risk" and general Volatility?**
> **Answer:**
> *   **General Volatility (Standard Deviation):** Treats *price jumps* (profit for farmers) and *price drops* (loss) as "risk."
> *   **Downside Risk:** Only counts deviations **below the mean**.
> *   **Why it matters:** Farmers only care about the risk of prices *falling*. Calculating Downside Deviation gives a more accurate risk profile for producers.

**Q12: How are you generating the historical data for the analytics view?**
> **Answer:** *(Be honest here!)*
> The **Live Prices** are real and scraped in real-time. For the **deep historical analysis** (charts), the current prototype generates a realistic time-series dataset anchored to the live price. It uses a mathematical model (Sine waves for seasonality + Trend component + Random noise) to simulate 12 months of market behavior. This ensures the statistical engine has robust data to demonstrate the math without hitting the NECC server for thousands of records during a demo.

---

## 📌 Section 5: Forecasting
**Q13: Which forecasting models did you consider?**
> **Answer:**
> 1.  **Simple Moving Average (SMA):** Good for smoothing trends.
> 2.  **Weighted Moving Average (WMA):** Gives more importance to recent prices.
> 3.  **Exponential Smoothing:** The most advanced method we used, which applies an exponentially decreasing weight to older data.

**Q14: What is the "Confidence Interval" in your forecast?**
> **Answer:** It's the shaded region around the prediction line. It represents the range where the future price is likely to fall with 95% probability, based on the historical volatility (Standard Deviation) of the data.

---

## 📌 Section 6: Future Scope
**Q15: How would you improve this project if given more time?**
> **Answer:**
> 1.  **Database Integration:** Store scraped data in MongoDB to build a real long-term historical dataset instead of scraping on demand.
> 2.  **Authentication:** Add user login for farmers/traders to save their favorite markets.
> 3.  **Weather API Integration:** Correlate egg production drops with temperature/heat waves (since heat affects poultry production).
