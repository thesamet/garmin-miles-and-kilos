const LBS_TO_KG = 0.453592;
const CONVERTED_ATTR = 'data-kg-converted';

// Inject CSS to hide unconverted SVG text until processed
const style = document.createElement('style');
style.textContent = `
  svg text:not([${CONVERTED_ATTR}]),
  svg tspan:not([${CONVERTED_ATTR}]) {
    opacity: 0;
    transition: opacity 0.1s;
  }
  svg text[${CONVERTED_ATTR}],
  svg tspan[${CONVERTED_ATTR}] {
    opacity: 1;
  }
`;
document.head.appendChild(style);

function convertWeight(lbsValue) {
  return (lbsValue * LBS_TO_KG).toFixed(1);
}

function isWeightRelatedSvg(svg) {
  const text = svg.textContent || '';
  return /Pounds\s*\(lbs\)/i.test(text) || /Kilograms\s*\(kg\)/i.test(text);
}

function convertWeightsOnPage() {
  // Handle SVG text elements (for chart axes)
  const svgs = document.querySelectorAll('svg');
  svgs.forEach(svg => {
    const isWeightChart = isWeightRelatedSvg(svg);

    const textElements = svg.querySelectorAll('text, tspan');
    textElements.forEach(el => {
      // Skip already converted elements
      if (el.hasAttribute(CONVERTED_ATTR)) {
        return;
      }

      const original = el.textContent;
      let converted = original;

      // Convert "X lbs" patterns
      const lbsRegex = /(\d+\.?\d*)\s*lbs?/gi;
      if (lbsRegex.test(original)) {
        converted = original.replace(/(\d+\.?\d*)\s*lbs?/gi, (match, lbs) => {
          return `${convertWeight(parseFloat(lbs))} kg`;
        });
      }

      // Convert "Pounds (lbs)" axis label
      converted = converted.replace(/Pounds\s*\(lbs\)/gi, 'Kilograms (kg)');

      // Convert bare numbers only in weight-related charts
      if (isWeightChart && original === converted) {
        const bareNumberMatch = original.match(/^(\d+\.?\d*)$/);
        if (bareNumberMatch) {
          const num = parseFloat(bareNumberMatch[1]);
          if (num > 15 && num <= 400) {
            converted = convertWeight(num);
          }
        }
      }

      if (original !== converted) {
        el.textContent = converted;
      }
      // Mark as processed (converted or not needing conversion)
      el.setAttribute(CONVERTED_ATTR, 'true');
    });
  });

  // Handle regular text nodes (for table data, popups, etc.)
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);

  textNodes.forEach(node => {
    const original = node.textContent;
    let converted = original;

    const lbsRegex = /(\d+\.?\d*)\s*lbs?/gi;
    if (lbsRegex.test(original)) {
      converted = original.replace(/(\d+\.?\d*)\s*lbs?/gi, (match, lbs) => {
        return `${convertWeight(parseFloat(lbs))} kg`;
      });
    }

    converted = converted.replace(/Pounds\s*\(lbs\)/gi, 'Kilograms (kg)');

    if (original !== converted) {
      node.textContent = converted;
    }
  });
}

// Run on initial load
convertWeightsOnPage();

// Watch for dynamic content updates with debounce
let timeout = null;
const observer = new MutationObserver(() => {
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(convertWeightsOnPage, 50);
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
