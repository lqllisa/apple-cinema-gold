"""Build the single installable Lampa plugin. No npm or runtime dependencies."""
import json
from pathlib import Path

root = Path(__file__).resolve().parent
source = (root / 'src/plugin.js').read_text()
styles = (root / 'src/styles.css').read_text()
assert source.count('__ACG_STYLES__') == 1
(root / 'apple_cinema_gold.js').write_text(source.replace('__ACG_STYLES__', json.dumps(styles, ensure_ascii=False)))
