# GitHub Pages Deployment Guide

## 🚀 Automatic Deployment Setup

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

### Current Configuration:
- **Live Site**: https://grantdozier.github.io/jeeperscampers
- **Auto-deploy**: Triggers on every push to `main` branch
- **Build Tool**: Create React App with TypeScript
- **Hosting**: GitHub Pages

### Files Created:
1. `.github/workflows/deploy.yml` - GitHub Actions workflow
2. `package.json` - Already configured with homepage and deploy scripts

### Manual Deployment (if needed):
```bash
npm run deploy
```

### GitHub Repository Settings:
1. Go to your repo: https://github.com/grantdozier/jeeperscampers
2. Navigate to **Settings** > **Pages**
3. Set **Source** to "Deploy from a branch"
4. Select **Branch**: `gh-pages`
5. **Folder**: `/ (root)`

### Workflow Features:
- ✅ Builds on Node.js 18
- ✅ Installs dependencies with npm ci
- ✅ Builds the React app
- ✅ Deploys to gh-pages branch
- ✅ Only deploys from main branch
- ✅ Runs on every push and PR

### Environment Variables:
- `PUBLIC_URL`: `/jeeperscampers` (for correct asset paths)
- `CI`: `false` (to treat warnings as non-fatal)

### Next Steps:
1. Push this code to your main branch
2. GitHub Actions will automatically build and deploy
3. Your site will be live at: https://grantdozier.github.io/jeeperscampers

### Troubleshooting:
- Check the **Actions** tab in your GitHub repo for build status
- Ensure GitHub Pages is enabled in repository settings
- Verify the gh-pages branch is created after first deployment
