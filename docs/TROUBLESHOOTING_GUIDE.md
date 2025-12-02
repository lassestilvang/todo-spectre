# Todo Spectre - Troubleshooting Guide

## Table of Contents
1. [Common Issues](#common-issues)
2. [Error Messages](#error-messages)
3. [Performance Problems](#performance-problems)
4. [Authentication Issues](#authentication-issues)
5. [Database Problems](#database-problems)
6. [Deployment Issues](#deployment-issues)
7. [API Errors](#api-errors)
8. [Browser-Specific Issues](#browser-specific-issues)
9. [Mobile Issues](#mobile-issues)
10. [Advanced Troubleshooting](#advanced-troubleshooting)

## Common Issues

### Application Won't Start

**Symptoms:**
- `bun run dev` fails to start
- Server crashes immediately
- No error messages

**Solutions:**
1. **Check Node.js/Bun versions**:
   ```bash
   node -v  # Should be v20+
   bun -v   # Should be v1.3.3+
   ```

2. **Clean install dependencies**:
   ```bash
   rm -rf node_modules bun.lock
   bun install
   ```

3. **Check environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with correct values
   ```

### Blank Screen After Login

**Symptoms:**
- Login succeeds but screen is blank
- No tasks or UI elements visible
- Console shows no errors

**Solutions:**
1. **Clear browser cache** and hard refresh (Ctrl+F5)
2. **Check browser console** for JavaScript errors
3. **Disable browser extensions** that might interfere
4. **Try incognito mode** to rule out extension issues

### Tasks Not Syncing

**Symptoms:**
- Changes don't appear across devices
- Tasks disappear after refresh
- Inconsistent task states

**Solutions:**
1. **Check internet connection**
2. **Refresh the page** (Ctrl+R)
3. **Log out and back in** to reset session
4. **Check browser console** for sync errors

## Error Messages

### "Unauthorized" Error

**Causes:**
- Expired session token
- Invalid authentication
- Missing credentials

**Solutions:**
1. **Log out and log back in**
2. **Clear cookies** and local storage
3. **Check token expiration** in application settings
4. **Verify user permissions**

### "Database Connection Failed"

**Causes:**
- Incorrect DATABASE_URL
- Database file missing
- Permission issues
- Database corruption

**Solutions:**
1. **Check .env file**:
   ```env
   DATABASE_URL="file:./prod.db"
   ```

2. **Verify database file exists**:
   ```bash
   ls -la prod.db
   ```

3. **Check file permissions**:
   ```bash
   chmod 644 prod.db
   ```

4. **Run database health check**:
   ```bash
   bun run db:health
   ```

### "Invalid Input" Error

**Causes:**
- Missing required fields
- Invalid data formats
- Exceeding length limits
- Invalid date formats

**Solutions:**
1. **Check form validation** messages
2. **Verify all required fields** are filled
3. **Use correct date formats** (YYYY-MM-DD)
4. **Check character limits** (title: 255 chars max)

## Performance Problems

### Slow Page Load

**Symptoms:**
- Page takes >2s to load
- Spinner keeps spinning
- UI feels sluggish

**Solutions:**
1. **Check network tab** for slow requests
2. **Clear browser cache** and cookies
3. **Disable heavy browser extensions**
4. **Check server logs** for performance issues

### API Timeouts

**Symptoms:**
- API calls take >5s
- Requests fail with timeout
- UI becomes unresponsive

**Solutions:**
1. **Check server load**:
   ```bash
   top
   ```

2. **Review slow queries**:
   ```bash
   # Check database performance
   sqlite3 prod.db "EXPLAIN QUERY PLAN SELECT * FROM tasks;"
   ```

3. **Optimize database**:
   ```bash
   sqlite3 prod.db "VACUUM;"
   sqlite3 prod.db "ANALYZE;"
   ```

4. **Check network conditions**

### Memory Leaks

**Symptoms:**
- Browser tab uses >1GB memory
- Application slows down over time
- Frequent garbage collection pauses

**Solutions:**
1. **Take heap snapshot** in Chrome DevTools
2. **Check for event listener leaks**
3. **Review React component unmounting**
4. **Monitor memory usage**:
   ```javascript
   // Add memory monitoring
   setInterval(() => {
     console.log('Memory usage:', performance.memory.usedJSHeapSize / 1024 / 1024, 'MB');
   }, 5000);
   ```

## Authentication Issues

### Login Fails

**Symptoms:**
- "Invalid credentials" error
- Login button does nothing
- Redirect loop after login

**Solutions:**
1. **Reset password** using forgot password flow
2. **Check Caps Lock** is not on
3. **Clear browser cookies** and cache
4. **Try different browser** to rule out extensions

### Session Expires Too Quickly

**Symptoms:**
- Frequent re-login prompts
- Session times out quickly
- "Session expired" errors

**Solutions:**
1. **Check session configuration**:
   ```env
   # In .env file
   NEXTAUTH_SECRET="your-strong-secret"
   JWT_SECRET="your-strong-jwt-secret"
   ```

2. **Adjust session timeout** in auth configuration

3. **Check system clock** is synchronized

4. **Review token rotation** settings

## Database Problems

### Database Corruption

**Symptoms:**
- "Database disk image is malformed"
- Sudden application crashes
- Inconsistent data

**Solutions:**
1. **Restore from backup**:
   ```bash
   cp backup-prod.db prod.db
   ```

2. **Run integrity check**:
   ```bash
   sqlite3 prod.db "PRAGMA integrity_check;"
   ```

3. **Rebuild database**:
   ```bash
   sqlite3 prod.db .dump | sqlite3 new-prod.db
   mv new-prod.db prod.db
   ```

### Slow Database Queries

**Symptoms:**
- API endpoints take >1s
- Database operations timeout
- High CPU usage from SQLite

**Solutions:**
1. **Add indexes**:
   ```sql
   CREATE INDEX idx_tasks_user_id ON tasks(user_id);
   CREATE INDEX idx_tasks_due_date ON tasks(due_date);
   ```

2. **Optimize queries**:
   ```bash
   sqlite3 prod.db "EXPLAIN QUERY PLAN SELECT * FROM tasks WHERE user_id = 1;"
   ```

3. **Review query patterns** in application code

4. **Consider database sharding** for large datasets

## Deployment Issues

### Deployment Fails

**Symptoms:**
- CI/CD pipeline fails
- `bun run deploy` errors out
- Application doesn't start after deploy

**Solutions:**
1. **Check CI/CD logs** for specific errors
2. **Verify environment variables** in deployment target
3. **Test locally first**:
   ```bash
   bun run build:prod
   ```

4. **Check deployment configuration**:
   ```javascript
   // In deploy.config.js
   module.exports = {
     targets: {
       vercel: {
         // Verify all settings
       }
     }
   };
   ```

### Build Errors

**Symptoms:**
- `bun run build` fails
- TypeScript compilation errors
- Missing dependencies

**Solutions:**
1. **Clean build**:
   ```bash
   rm -rf .next
   bun install
   bun run build
   ```

2. **Check TypeScript errors**:
   ```bash
   bun run lint
   ```

3. **Verify all dependencies**:
   ```bash
   bun install --production
   ```

4. **Check Node.js/Bun compatibility**

## API Errors

### 404 Not Found

**Symptoms:**
- API endpoint returns 404
- Route doesn't exist
- Incorrect API URL

**Solutions:**
1. **Check API documentation** for correct endpoints
2. **Verify route files** exist in `src/app/api/`
3. **Check Next.js routing** configuration
4. **Test with Postman/curl**:
   ```bash
   curl -v http://localhost:3001/api/tasks
   ```

### 500 Internal Server Error

**Symptoms:**
- API returns 500 error
- Server crashes
- Unhandled exceptions

**Solutions:**
1. **Check server logs**:
   ```bash
   tail -f logs/error.log
   ```

2. **Review error handling** in API routes

3. **Test with minimal payload**:
   ```bash
   curl -X POST http://localhost:3001/api/tasks -d '{"title":"test"}'
   ```

4. **Check database connection** and queries

## Browser-Specific Issues

### Chrome Issues

**Symptoms:**
- UI rendering problems
- JavaScript errors
- Extension conflicts

**Solutions:**
1. **Disable all extensions** and test
2. **Clear Chrome cache** and cookies
3. **Try Chrome incognito mode**
4. **Update Chrome** to latest version

### Firefox Issues

**Symptoms:**
- CSS layout problems
- Form submission issues
- Performance differences

**Solutions:**
1. **Check Firefox console** for errors
2. **Disable tracking protection** temporarily
3. **Clear Firefox cache**
4. **Test with Firefox Developer Edition**

### Safari Issues

**Symptoms:**
- Animation performance issues
- WebSocket connection problems
- LocalStorage limitations

**Solutions:**
1. **Enable Safari Developer Menu**
2. **Clear website data** for the site
3. **Disable content blockers**
4. **Test with Safari Technology Preview**

## Mobile Issues

### Touch Interface Problems

**Symptoms:**
- Buttons hard to tap
- Gestures not working
- Scrolling issues

**Solutions:**
1. **Check viewport meta tag**:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```

2. **Review touch target sizes** (minimum 48x48px)

3. **Test with device emulation** in Chrome DevTools

4. **Check for hover vs. touch conflicts**

### Offline Functionality Issues

**Symptoms:**
- App doesn't work offline
- Data not syncing when back online
- Cached data not available

**Solutions:**
1. **Check service worker** registration
2. **Verify cache strategies**
3. **Test offline mode** in Chrome DevTools
4. **Review offline data handling** logic

## Advanced Troubleshooting

### Debugging Techniques

**1. Browser Debugging:**
```javascript
// Add debug logging
console.debug('Debug info:', { user, task, context });

// Performance profiling
console.time('operation');
// ... code to measure
console.timeEnd('operation');
```

**2. Server Debugging:**
```bash
# Enable debug mode
NEXT_PUBLIC_FEATURE_DEBUG_MODE=true bun run dev

# Check all logs
tail -f logs/*.log
```

**3. Database Debugging:**
```bash
# Enable SQLite logging
sqlite3 prod.db
.sqlite> .log stdout
.sqlite> SELECT * FROM tasks LIMIT 10;
```

### Performance Profiling

**1. CPU Profiling:**
```bash
# Start CPU profiling
bun run dev --prof

# Analyze profile
bun run --prof-process isolate-*.log
```

**2. Memory Profiling:**
```javascript
// Take heap snapshot
if (typeof window !== 'undefined') {
  console.log('Taking heap snapshot...');
  // Use Chrome DevTools to capture snapshot
}
```

**3. Network Profiling:**
```bash
# Test API performance
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/tasks
```

### Error Analysis

**1. Stack Trace Analysis:**
- Identify the root cause in error stack traces
- Look for the deepest frame in your code
- Check for async/await issues

**2. Log Correlation:**
- Correlate errors across different log files
- Look for patterns in error timing
- Check for related warnings before errors

**3. Dependency Analysis:**
- Check for version conflicts
- Review changelogs for breaking changes
- Test with minimal dependency set

## Troubleshooting Tools

### Built-in Tools

**1. Health Check:**
```bash
bun run db:health
```

**2. Test Coverage:**
```bash
bun run coverage
```

**3. Performance Tests:**
```bash
bun run test:performance
```

### External Tools

**1. Browser DevTools:**
- Chrome/Firefox/Safari developer tools
- Network tab for API analysis
- Performance tab for profiling
- Memory tab for leak detection

**2. API Testing Tools:**
- Postman for API testing
- Insomnia for API exploration
- curl for command-line testing

**3. Database Tools:**
- SQLite Browser for database inspection
- DB Browser for SQLite
- sqlite3 command-line tool

## Troubleshooting Checklist

### Step-by-Step Debugging

1. **Reproduce the issue** consistently
2. **Isolate the problem** to specific component
3. **Check logs and errors** for clues
4. **Test with minimal configuration**
5. **Review recent changes** that might have caused it
6. **Search documentation** and known issues
7. **Create minimal test case** to demonstrate
8. **Implement fix** and verify
9. **Document the solution** for future reference

### Common Fixes to Try

- [ ] Restart the application
- [ ] Clear browser cache
- [ ] Update dependencies
- [ ] Check environment variables
- [ ] Review recent code changes
- [ ] Test in different browser
- [ ] Verify database integrity
- [ ] Check network connectivity
- [ ] Review server logs
- [ ] Test with minimal data set

## Troubleshooting Resources

### Documentation
- [API Documentation](API_DOCUMENTATION.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [User Guide](USER_GUIDE.md)
- [Maintenance Guide](MAINTENANCE_GUIDE.md)

### Support Channels
- GitHub Issues: Report bugs and feature requests
- Community Forum: Ask questions and share solutions
- Email Support: support@example.com
- Status Page: Check system status

## Troubleshooting Best Practices

### Effective Debugging

1. **Divide and Conquer**: Break problem into smaller parts
2. **Scientific Method**: Hypothesize, test, analyze
3. **Reproducibility**: Ensure issue can be reproduced consistently
4. **Documentation**: Record findings and solutions

### Problem Prevention

1. **Comprehensive Testing**: Catch issues early
2. **Code Reviews**: Prevent problems before they occur
3. **Monitoring**: Detect issues before users do
4. **Documentation**: Make systems understandable

## Troubleshooting Case Studies

### Case Study: Slow Task Loading

**Problem:** Tasks took 5+ seconds to load
**Root Cause:** Missing database index on user_id
**Solution:** Added index and optimized query
**Result:** Load time reduced to <200ms

### Case Study: Authentication Failures

**Problem:** Users randomly logged out
**Root Cause:** Short JWT expiration time
**Solution:** Increased token lifetime and added refresh
**Result:** Stable authentication sessions

### Case Study: Memory Leaks

**Problem:** Browser tab crashed after 1 hour
**Root Cause:** Unsubscribed event listeners
**Solution:** Added cleanup in useEffect return
**Result:** Stable memory usage over time

## Troubleshooting Conclusion

### Key Takeaways

1. **Systematic Approach**: Follow structured debugging
2. **Comprehensive Logging**: Essential for diagnosis
3. **Reproducibility**: Critical for effective troubleshooting
4. **Documentation**: Prevents repeated issues

### Final Advice

> "The best troubleshooting is prevention through good design, testing, and monitoring."

When issues do occur:
1. Stay calm and methodical
2. Gather all available information
3. Test hypotheses systematically
4. Document solutions thoroughly
5. Share knowledge with the team

**Remember:** Every problem is an opportunity to improve the system and prevent future issues.