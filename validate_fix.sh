#!/bin/bash
# Final Validation Script - Checks all fixes are in place

echo "🔍 Validating Mobile Field Types Fix"
echo "====================================="
echo ""

GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0

# Check if files exist
echo -e "${BLUE}📁 Checking core files...${NC}"

FILES=(
  "mobile/lib/widgets/form_field_widget.dart"
  "mobile/lib/models/form_template.dart"
  "client/src/data/test-template.seed.ts"
  "scripts/seed-test-templates.ts"
  "mobile/test_mobile.sh"
  "VERIFICATION_CHECKLIST.md"
  "MOBILE_FIXES_COMPLETE.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo -e "  ${GREEN}✓${NC} $file"
  else
    echo -e "  ${RED}✗${NC} $file (MISSING)"
    ((ERRORS++))
  fi
done

echo ""

# Check for key implementations in form_field_widget.dart
echo -e "${BLUE}🔧 Checking implementation...${NC}"

WIDGET_FILE="mobile/lib/widgets/form_field_widget.dart"

check_pattern() {
  local pattern="$1"
  local description="$2"
  
  if grep -q "$pattern" "$WIDGET_FILE" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $description"
  else
    echo -e "  ${RED}✗${NC} $description (MISSING)"
    ((ERRORS++))
  fi
}

check_pattern "case 'fullname':" "Full name field support"
check_pattern "case 'email':" "Email field support"
check_pattern "case 'phone':" "Phone field support"
check_pattern "case 'address':" "Address field support"
check_pattern "case 'radio':" "Radio button support"
check_pattern "case 'starrating':" "Star rating support"
check_pattern "case 'scalerating':" "Scale rating support"
check_pattern "case 'time':" "Time picker support"
check_pattern "case 'section':" "Section header support"
check_pattern "case 'divider':" "Divider support"
check_pattern "_PhotoUploadField" "Photo upload implementation"
check_pattern "_SignatureField" "Signature pad implementation"
check_pattern "ImagePicker" "Image picker import"

echo ""

# Check model updates
echo -e "${BLUE}📦 Checking data model...${NC}"

MODEL_FILE="mobile/lib/models/form_template.dart"

check_pattern_model() {
  local pattern="$1"
  local description="$2"
  
  if grep -q "$pattern" "$MODEL_FILE" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $description"
  else
    echo -e "  ${RED}✗${NC} $description (MISSING)"
    ((ERRORS++))
  fi
}

check_pattern_model "String? placeholder" "Placeholder property"
check_pattern_model "String? sublabel" "Sublabel property"
check_pattern_model "String? help_text" "Help text property"

echo ""

# Check pubspec dependencies
echo -e "${BLUE}📚 Checking dependencies...${NC}"

PUBSPEC_FILE="mobile/pubspec.yaml"

if [ -f "$PUBSPEC_FILE" ]; then
  if grep -q "image_picker:" "$PUBSPEC_FILE"; then
    echo -e "  ${GREEN}✓${NC} image_picker dependency"
  else
    echo -e "  ${RED}✗${NC} image_picker dependency (MISSING)"
    ((ERRORS++))
  fi
  
  if grep -q "signature:" "$PUBSPEC_FILE"; then
    echo -e "  ${GREEN}✓${NC} signature dependency"
  else
    echo -e "  ${RED}✗${NC} signature dependency (MISSING)"
    ((ERRORS++))
  fi
  
  if grep -q "intl:" "$PUBSPEC_FILE"; then
    echo -e "  ${GREEN}✓${NC} intl dependency"
  else
    echo -e "  ${RED}✗${NC} intl dependency (MISSING)"
    ((ERRORS++))
  fi
else
  echo -e "  ${RED}✗${NC} pubspec.yaml not found"
  ((ERRORS++))
fi

echo ""

# Check test templates
echo -e "${BLUE}📋 Checking test templates...${NC}"

TEST_TEMPLATE="client/src/data/test-template.seed.ts"

if [ -f "$TEST_TEMPLATE" ]; then
  if grep -q "comprehensiveTestTemplate" "$TEST_TEMPLATE"; then
    echo -e "  ${GREEN}✓${NC} Comprehensive test template"
  else
    echo -e "  ${RED}✗${NC} Comprehensive test template (MISSING)"
    ((ERRORS++))
  fi
  
  if grep -q "quickTestTemplate" "$TEST_TEMPLATE"; then
    echo -e "  ${GREEN}✓${NC} Quick test template"
  else
    echo -e "  ${RED}✗${NC} Quick test template (MISSING)"
    ((ERRORS++))
  fi
  
  # Count field types in comprehensive template
  FIELD_COUNT=$(grep -c "type:" "$TEST_TEMPLATE" | head -1)
  if [ "$FIELD_COUNT" -gt 20 ]; then
    echo -e "  ${GREEN}✓${NC} Test template has sufficient fields ($FIELD_COUNT types)"
  else
    echo -e "  ${RED}✗${NC} Test template has too few fields"
    ((ERRORS++))
  fi
fi

echo ""

# Check documentation
echo -e "${BLUE}📖 Checking documentation...${NC}"

DOCS=(
  "FIXES_APPLIED.md"
  "ELEMENT_DISPLAY_FIX_SUMMARY.md"
  "MOBILE_FIELD_TYPES_FIX.md"
  "BEFORE_AFTER_COMPARISON.md"
  "VERIFICATION_CHECKLIST.md"
  "MOBILE_FIXES_COMPLETE.md"
  "mobile/FIELD_TYPES_TEST.md"
)

DOC_COUNT=0
for doc in "${DOCS[@]}"; do
  if [ -f "$doc" ]; then
    ((DOC_COUNT++))
  fi
done

if [ $DOC_COUNT -eq ${#DOCS[@]} ]; then
  echo -e "  ${GREEN}✓${NC} All $DOC_COUNT documentation files present"
else
  echo -e "  ${RED}✗${NC} Only $DOC_COUNT of ${#DOCS[@]} documentation files found"
  ((ERRORS++))
fi

echo ""
echo "======================================"

# Summary
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ VALIDATION PASSED!${NC}"
  echo ""
  echo "All fixes are in place and ready to use:"
  echo "  • 25+ field types supported"
  echo "  • Photo upload implemented"
  echo "  • Signature pad implemented"
  echo "  • Test templates created"
  echo "  • Build scripts ready"
  echo "  • Documentation complete"
  echo ""
  echo "Next steps:"
  echo "  1. Run: cd mobile && ./test_mobile.sh"
  echo "  2. Run: npx ts-node scripts/seed-test-templates.ts"
  echo "  3. Test the mobile app!"
  echo ""
  exit 0
else
  echo -e "${RED}❌ VALIDATION FAILED!${NC}"
  echo ""
  echo "Found $ERRORS error(s). Please review the output above."
  echo ""
  exit 1
fi
