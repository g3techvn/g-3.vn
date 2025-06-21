# 🛠️ QUICK SETUP - SOLD COUNT OPTIMIZATION

> **Simplified setup instructions for G3-TECH sold count optimization**

---

## 📚 **COMPLETE DOCUMENTATION**

**For full details, see:** [`docs/SOLD_COUNT_OPTIMIZATION_COMPLETE.md`](../docs/SOLD_COUNT_OPTIMIZATION_COMPLETE.md)

---

## ⚡ **QUICK START**

### **Step 1: Execute SQL Migration**

1. **Open Supabase Dashboard** → SQL Editor
2. **Copy & paste** content from `scripts/add-sold-count-column.sql`
3. **Execute** the SQL script
4. **Verify** successful execution

### **Step 2: Test Implementation**

```bash
# Start development server
npm run dev

# Test new API endpoint
curl "http://localhost:3000/api/products/sold-counts-optimized"

# Access test page
open http://localhost:3000/admin/sold-count-test
```

### **Step 3: Verify Data**

```sql
-- Check sold_count column exists and has data
SELECT id, name, sold_count 
FROM products 
WHERE status = true 
ORDER BY sold_count DESC 
LIMIT 10;

-- Verify triggers are active
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name LIKE '%sold_count%';
```

---

## 🧪 **TESTING**

### **Performance Test**
```bash
# Old API (for comparison)
time curl "http://localhost:3000/api/products/sold-counts?product_ids=1,2,3"

# New optimized API
time curl "http://localhost:3000/api/products/sold-counts-optimized?product_ids=1,2,3"
```

### **Test Page Access**
```
http://localhost:3000/admin/sold-count-test
```

---

## ✅ **SUCCESS INDICATORS**

- [ ] SQL migration executed without errors
- [ ] New API endpoint returns data
- [ ] Test page loads and shows performance comparison
- [ ] Data consistency 100% between old and new methods
- [ ] Performance improvement 25%+ visible

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

1. **SQL Errors**: Check database permissions and syntax
2. **API 500 Errors**: Verify Supabase connection and environment variables
3. **No Data**: Run `SELECT update_all_sold_counts();` to populate initial data
4. **Trigger Issues**: Check trigger creation with SQL verification queries

### **Support:**

- **Complete Guide**: `docs/SOLD_COUNT_OPTIMIZATION_COMPLETE.md`
- **Test Tools**: `http://localhost:3000/admin/sold-count-test`
- **Validation Scripts**: `scripts/test-sold-count-consistency.js`

---

## 🎯 **NEXT STEPS**

1. **Test thoroughly** using the test page
2. **Monitor performance** improvements
3. **Start migrating components** one by one
4. **Follow migration guide** in complete documentation

**Ready to optimize your sold count performance! 🚀** 