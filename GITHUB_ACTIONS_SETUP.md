# GitHub Actions Setup for SwiftInvoice Cron Jobs

This guide will help you set up automatic cron jobs using GitHub Actions.

## 📋 **What This Does**

- **Recurring Invoices**: Runs daily at 9:00 AM UTC to create invoices from recurring templates
- **Reminders**: Runs daily at 10:00 AM UTC to send reminder emails for overdue invoices
- **Manual Trigger**: You can also trigger these jobs manually from GitHub

## 🚀 **Setup Steps**

### **Step 1: Push Your Code to GitHub**

1. Make sure all your files are committed:
   ```bash
   git add .
   git commit -m "Add GitHub Actions cron jobs"
   git push origin main
   ```

### **Step 2: Set Up GitHub Secrets**

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**

#### **Add these secrets:**

**Secret 1: APP_URL**
- **Name**: `APP_URL`
- **Value**: Your app URL (e.g., `https://your-app.vercel.app` or `https://your-domain.com`)

**Secret 2: CRON_SECRET**
- **Name**: `CRON_SECRET`
- **Value**: Your cron secret (same as in your .env file, e.g., `my-test-cron-secret-123`)

### **Step 3: Verify the Workflow**

1. Go to the **Actions** tab in your GitHub repository
2. You should see "Cron Jobs" workflow
3. Click on it to see the details

### **Step 4: Test the Setup**

#### **Option A: Manual Test (Recommended)**
1. Go to **Actions** → **Cron Jobs**
2. Click **Run workflow** button
3. Select your branch and click **Run workflow**
4. Watch the logs to see if it works

#### **Option B: Wait for Automatic Run**
- The jobs will run automatically at 9:00 AM and 10:00 AM UTC daily
- Check the Actions tab to see the results

## ⏰ **Schedule Details**

- **Recurring Invoices**: Every day at 9:00 AM UTC
- **Reminders**: Every day at 10:00 AM UTC
- **Timezone**: UTC (you can change this in the workflow file if needed)

## 🔧 **Customization**

### **Change Schedule**
Edit `.github/workflows/cron-jobs.yml` and modify the cron expressions:
```yaml
# Examples:
- cron: '0 9 * * *'    # Daily at 9 AM UTC
- cron: '0 9 * * 1'    # Weekly on Monday at 9 AM UTC
- cron: '0 9 1 * *'    # Monthly on 1st at 9 AM UTC
```

### **Change Timezone**
Add timezone to the workflow:
```yaml
jobs:
  recurring-invoices:
    runs-on: ubuntu-latest
    steps:
      - name: Set timezone
        run: sudo timedatectl set-timezone America/New_York
```

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"Unauthorized" Error**
   - Check that `CRON_SECRET` matches your .env file
   - Make sure your app is running and accessible

2. **"Connection Refused" Error**
   - Verify `APP_URL` is correct and your app is deployed
   - Check if your app is running

3. **Workflow Not Running**
   - Make sure the workflow file is in `.github/workflows/` directory
   - Check that it's committed and pushed to GitHub

### **Check Logs:**
1. Go to **Actions** tab
2. Click on a workflow run
3. Click on the job name
4. Expand the steps to see detailed logs

## 📊 **Monitoring**

- **GitHub Actions**: Check the Actions tab for run history
- **Your App**: Check your invoices and email logs
- **Notifications**: GitHub will email you if workflows fail

## 🎉 **Success Indicators**

You'll know it's working when:
- ✅ Workflows run successfully in GitHub Actions
- ✅ New invoices appear in your app from recurring templates
- ✅ Reminder emails are sent for overdue invoices
- ✅ No errors in the workflow logs

## 🔄 **Next Steps**

1. **Test**: Run the workflow manually first
2. **Monitor**: Check the Actions tab for a few days
3. **Verify**: Confirm invoices and emails are being created
4. **Customize**: Adjust schedules if needed

---

**Need Help?** Check the GitHub Actions documentation or create an issue in your repository.
