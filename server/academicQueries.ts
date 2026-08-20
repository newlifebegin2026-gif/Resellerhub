import { Request, Response } from 'express';
import { getResellers, getOrders, getDailyWorks, getDashboardStats } from '../server/db';

export interface SQLBenchmarkQuery {
  id: number;
  title: string;
  category: string;
  description: string;
  sql: string;
  explanation: string;
}

export const ACADEMIC_SQL_QUERIES: SQLBenchmarkQuery[] = [
  {
    id: 1,
    title: 'Top 5 Resellers by Total Gross Revenue (JOIN & Aggregate)',
    category: 'JOIN & Aggregates',
    description: 'Retrieves active resellers ordered by their total confirmed order value.',
    sql: `SELECT r.id, r.name, r.phone, COUNT(o.id) AS total_orders, COALESCE(SUM(o.order_amount), 0) AS gross_sales
FROM resellers r
LEFT JOIN orders o ON r.id = o.reseller_id
WHERE r.status = 'active'
GROUP BY r.id, r.name, r.phone
ORDER BY gross_sales DESC
LIMIT 5;`,
    explanation: 'Uses LEFT JOIN to include active resellers even if they have 0 orders, aggregates count and sum, and sorts descending.',
  },
  {
    id: 2,
    title: 'Resellers with Above-Average Order Value (Subquery & HAVING)',
    category: 'Subqueries & HAVING',
    description: 'Finds resellers whose Average Order Value (AOV) exceeds the global platform average.',
    sql: `SELECT r.name, COUNT(o.id) AS orders_count, AVG(o.order_amount) AS reseller_aov
FROM resellers r
JOIN orders o ON r.id = o.reseller_id
GROUP BY r.id, r.name
HAVING AVG(o.order_amount) > (
    SELECT AVG(order_amount) FROM orders
)
ORDER BY reseller_aov DESC;`,
    explanation: 'Demonstrates correlated/nested subquery in the HAVING clause to filter aggregated groups dynamically.',
  },
  {
    id: 3,
    title: 'ROAS & Marketing ROI Matrix per Reseller (Multi-Table Aggregation)',
    category: 'Multi-Source Analytics',
    description: 'Calculates the Return On Ad Spend (ROAS) and Cost Per Order for marketing shifts.',
    sql: `SELECT 
    r.name AS reseller_name,
    COALESCE(ord_summary.total_sales, 0) AS total_revenue,
    COALESCE(work_summary.total_ad_spend, 0) AS total_ad_spend,
    COALESCE(work_summary.total_hours, 0) AS total_hours_worked,
    CASE 
        WHEN COALESCE(work_summary.total_ad_spend, 0) > 0 
        THEN ROUND(COALESCE(ord_summary.total_sales, 0) / work_summary.total_ad_spend, 2)
        ELSE 0 
    END AS roas_ratio
FROM resellers r
LEFT JOIN (
    SELECT reseller_id, SUM(order_amount) AS total_sales, COUNT(id) AS order_count 
    FROM orders GROUP BY reseller_id
) ord_summary ON r.id = ord_summary.reseller_id
LEFT JOIN (
    SELECT reseller_id, SUM(ad_spend) AS total_ad_spend, SUM(total_hours) AS total_hours 
    FROM daily_works GROUP BY reseller_id
) work_summary ON r.id = work_summary.reseller_id
ORDER BY roas_ratio DESC;`,
    explanation: 'Employs Derived Tables (Inline Views) to avoid Cartesian product duplication between orders and shift entries.',
  },
  {
    id: 4,
    title: 'District-wise Sales Density & Top Delivering Zones',
    category: 'Geographic Analysis',
    description: 'Groups orders by customer district to identify top regional e-commerce hubs.',
    sql: `SELECT district, COUNT(id) AS total_orders, SUM(order_amount) AS district_revenue, ROUND(AVG(order_amount), 2) AS avg_ticket
FROM orders
GROUP BY district
HAVING COUNT(id) >= 1
ORDER BY district_revenue DESC;`,
    explanation: 'Demonstrates spatial segmentation and grouping with aggregate calculations.',
  },
  {
    id: 5,
    title: 'Daily Shift Productivity: Revenue Produced Per Working Hour',
    category: 'Productivity Analysis',
    description: 'Measures hourly efficiency across reseller work shifts.',
    sql: `SELECT 
    w.work_date,
    w.reseller_name,
    w.total_hours,
    w.orders_generated,
    w.ad_spend,
    ROUND(w.ad_spend / NULLIF(w.orders_generated, 0), 2) AS cost_per_generated_order
FROM daily_works w
WHERE w.total_hours > 0
ORDER BY w.work_date DESC, w.total_hours DESC;`,
    explanation: 'Uses NULLIF to safely prevent division by zero in SQL financial ratios.',
  },
  {
    id: 6,
    title: 'Orders Fulfillment Breakdown by Status (Conditional Aggregation)',
    category: 'Fulfillment Metrics',
    description: 'Pivots order counts across Pending, Confirmed, Shipped, and Delivered.',
    sql: `SELECT 
    COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pending_orders,
    COUNT(CASE WHEN status = 'Confirmed' THEN 1 END) AS confirmed_orders,
    COUNT(CASE WHEN status = 'Shipped' THEN 1 END) AS shipped_orders,
    COUNT(CASE WHEN status = 'Delivered' THEN 1 END) AS delivered_orders,
    COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS cancelled_orders,
    COUNT(id) AS total_orders
FROM orders;`,
    explanation: 'Uses CASE inside COUNT/SUM for conditional aggregation without requiring multi-query round trips.',
  },
  {
    id: 7,
    title: 'Reseller Inactivity Audit (Subquery with NOT IN / LEFT JOIN NULL)',
    category: 'Integrity & Auditing',
    description: 'Finds registered active resellers who have never submitted a single order or daily shift.',
    sql: `SELECT r.id, r.name, r.phone, r.joined_date
FROM resellers r
WHERE r.id NOT IN (SELECT DISTINCT reseller_id FROM orders)
  AND r.id NOT IN (SELECT DISTINCT reseller_id FROM daily_works);`,
    explanation: 'Demonstrates set difference and anti-join logic essential for relational integrity audits.',
  },
  {
    id: 8,
    title: 'Customer Frequency & Repeat Order Detection',
    category: 'Customer Loyalty',
    description: 'Identifies customers who placed multiple orders across the reseller network.',
    sql: `SELECT customer_phone, customer_name, district, COUNT(id) AS total_purchases, SUM(order_amount) AS lifetime_spend
FROM orders
GROUP BY customer_phone, customer_name, district
ORDER BY total_purchases DESC, lifetime_spend DESC;`,
    explanation: 'Groups on unique customer phone identifiers to compute Customer Lifetime Value (CLV).',
  },
  {
    id: 9,
    title: 'Cumulative Daily Sales Window & Running Total',
    category: 'Analytical Window Functions',
    description: 'Calculates day-by-day revenue alongside a running cumulative total.',
    sql: `SELECT 
    DATE(order_date) AS order_day,
    SUM(order_amount) AS daily_sales,
    SUM(SUM(order_amount)) OVER (ORDER BY DATE(order_date)) AS running_cumulative_sales
FROM orders
GROUP BY DATE(order_date)
ORDER BY order_day ASC;`,
    explanation: 'Demonstrates SQL:2016 Window Function OVER (ORDER BY ...) for cumulative sum tracking.',
  },
  {
    id: 10,
    title: 'Reseller Performance Ranking (DENSE_RANK Window Function)',
    category: 'Ranking Functions',
    description: 'Assigns competition ranks to resellers based on generated revenue.',
    sql: `SELECT 
    r.name,
    COALESCE(SUM(o.order_amount), 0) AS total_revenue,
    DENSE_RANK() OVER (ORDER BY COALESCE(SUM(o.order_amount), 0) DESC) as revenue_rank
FROM resellers r
LEFT JOIN orders o ON r.id = o.reseller_id
GROUP BY r.id, r.name
ORDER BY revenue_rank ASC;`,
    explanation: 'Uses DENSE_RANK() to compute leaderboard standing without gaps.',
  }
];
