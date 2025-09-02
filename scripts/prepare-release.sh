#!/bin/bash

# Bravo Release Preparation Script
# This script helps prepare for testing and final release

set -e

echo "🚀 Bravo Release Preparation Script"
echo "===================================="
echo ""

# Function to show current status
show_status() {
    echo "📊 Current Status:"
    echo "  Branch: $(git branch --show-current)"
    echo "  Version: $(node -p "require('./package.json').version")"
    echo "  Uncommitted changes: $(git status --porcelain | wc -l | tr -d ' ')"
    echo ""
}

# Function to test on a branch
test_branch() {
    echo "🧪 Creating test branch..."
    
    # Create test branch
    git checkout -b test-release-$(date +%Y%m%d-%H%M%S)
    
    echo "✅ Test branch created"
    echo ""
    echo "You can now:"
    echo "  1. Push this branch: git push origin HEAD"
    echo "  2. Test GitHub Pages from this branch"
    echo "  3. When done, delete: git push origin --delete <branch-name>"
    echo ""
}

# Function to create clean history
create_clean_history() {
    echo "🧹 Creating clean history..."
    echo ""
    echo "⚠️  WARNING: This will rewrite history!"
    echo "Make sure you have backups of any branches you want to keep."
    echo ""
    read -p "Continue? (y/N): " confirm
    
    if [[ $confirm != "y" ]]; then
        echo "Aborted."
        exit 1
    fi
    
    # Create orphan branch
    git checkout --orphan release-v5.3.8
    
    # Add all files
    git add -A
    
    # Create initial commit
    git commit -m "Initial release: Bravo v5.3.8

Bravo extends Bootstrap 5.3.8 with modern enhancements:
- DynamicObserver for automatic component initialization
- Modal navigation system
- Enhanced dropdowns with hover support
- Interactive tooltips
- Full color system with stepped palettes
- iOS safe area support
- And much more...

Full documentation: https://appitudeio.github.io/bravo/"
    
    echo "✅ Clean history created on branch: release-v5.3.8"
    echo ""
    echo "Next steps:"
    echo "  1. Test everything works: npm test && npm run build"
    echo "  2. Force push to main: git push origin release-v5.3.8:main --force"
    echo "  3. Create tag: git tag v5.3.8"
    echo "  4. Push tag: git push origin v5.3.8"
    echo ""
}

# Main menu
PS3="Select an option: "
options=("Show Status" "Create Test Branch" "Create Clean History" "Exit")

show_status

select opt in "${options[@]}"
do
    case $opt in
        "Show Status")
            show_status
            ;;
        "Create Test Branch")
            test_branch
            break
            ;;
        "Create Clean History")
            create_clean_history
            break
            ;;
        "Exit")
            echo "Goodbye!"
            break
            ;;
        *) 
            echo "Invalid option"
            ;;
    esac
done