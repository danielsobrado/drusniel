import os
import re
from datetime import datetime, timedelta
from collections import defaultdict

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)
CONTENT_ROOT = os.path.join(PROJECT_ROOT, "site", "content", "posts")
START_DATE = datetime(2024, 4, 1)

# Taxonomy Rules: (type, canon_phase, type_code)
# Phase is NOT used for ID prefix anymore, but for metadata field
TYPE_LORE = ('Lore', 'lore', 'L')
TYPE_PREQUEL = ('Prequel', 'prequel', 'P')
TYPE_PROLOGUE = ('Prologue', 'prologue', 'R') # R for Prologue as per user req
TYPE_MAIN = ('Main', 'drusniel', 'M')
TYPE_META = ('Meta', 'meta', 'X')

# Prefix Mapping (Category -> 3-Letter Code)
CATEGORY_PREFIXES = {
    'umbrakor': 'UMB',
    "umbra'kor": 'UMB',
    'grukmar': 'GRU',
    'stonehold': 'STO',
    'lumeshire': 'LUM',
    'wyrmreach': 'WYR',
    'frostgard': 'FRO',
    'elenoria': 'ELE',
    'contian': 'CON',
    'astalor': 'AST',
}

# Specific Reclassifications (slug -> taxonomy)
TAXONOMY_OVERRIDES = {
    # EN Lore
    'magic-in-astalor': TYPE_LORE,
    'the-making-of-astalor': TYPE_LORE,
    'the-regions-of-astalor': TYPE_LORE,
    'discovering-the-nexus': TYPE_LORE,
    'arcane-echelons-the-contian-theocracy-quest-for-magical-supremacy': TYPE_LORE,
    'shields-up-the-resilient-defense-of-the-lumeshirean-divine-empire': TYPE_LORE,
    'forge-and-fire-the-mountain-kingdom-of-stonehold-stand-against-chaos': TYPE_LORE,
    'dark-depths-the-wymreach-dominion': TYPE_LORE,
    'the-zuraldarr': TYPE_LORE,

    # ES Lore
    'la-magia-en-astalor': TYPE_LORE,
    'la-creacion-de-astalor': TYPE_LORE,
    'descubriendo-las-regiones-de-astalor': TYPE_LORE,
    'descubriendo-el-nexus': TYPE_LORE,
    'echelones-arcanos-la-busqueda-de-la-teocracia-contiana-por-la-supremacia-magica': TYPE_LORE,
    'escudos-arriba-la-defensa-resiliente-del-imperio-divino-de-lumeshire': TYPE_LORE,
    'fragua-y-fuego-la-postura-del-reino-montanoso-de-stonehold-contra-el-caos': TYPE_LORE,
    'profundidades-oscuras-el-dominio-wymreach': TYPE_LORE,
    'los-zuraldarr': TYPE_LORE,

    # EN Prequels
    'eternal-woods-the-kingdom-of-elenoria-dance-with-nature': TYPE_PREQUEL,
    'ice-and-Iron-the-unyielding-warriors-of-the-empire-of-frostgard': TYPE_PREQUEL,
    'clash-of-clans-the-unruly-might-of-the-grukmar-tribes': TYPE_PREQUEL,
    'shadows-reign-the-umbrakor-dominions-pact-with-darkness': TYPE_PREQUEL,
    'the-call-to-zuraldi': TYPE_PREQUEL,
    'a-journey-interrupted': TYPE_PREQUEL,
    'the-screams-in-the-mist': TYPE_PREQUEL,
    'march-of-despair': TYPE_PREQUEL,
    
    # ES Prequels
    'bosques-eternos-la-danza-del-reino-de-elenoria-con-la-naturaleza': TYPE_PREQUEL,
    'hielo-y-hierro-los-guerreros-inquebrantables-del-imperio-de-frostgard': TYPE_PREQUEL,
    'choque-de-clanes-el-poder-indomito-de-las-tribus-grukmar': TYPE_PREQUEL,
    'el-reinado-de-las-sombras-el-Pacto-del-dominio-Umbrakor-con-la-oscuridad': TYPE_PREQUEL,
    'la-llamada-a-zuraldi': TYPE_PREQUEL,
    'un-viaje-complicado': TYPE_PREQUEL,
    'gritos-en-la-niebla': TYPE_PREQUEL,
    'la-marcha-de-la-desesperacion': TYPE_PREQUEL,
    
    # EN Prologue / Bridge
    'the-road-from-zuraldi-the-awakening': TYPE_PROLOGUE,
    'the-road-from-zuraldi-the-absence': TYPE_PROLOGUE,
    'the-road-from-zuraldi-the-nephews-doubt': TYPE_PROLOGUE,
    'the-road-from-zuraldi-the-followers': TYPE_PROLOGUE,
    'the-road-from-zuraldi-the-decision': TYPE_PROLOGUE,

    # ES Prologue / Bridge
    'el-camino-de-zuraldi-el-despertar': TYPE_PROLOGUE,
    'el-camino-de-zuraldi-la-ausencia': TYPE_PROLOGUE,
    'el-camino-de-zuraldi-la-duda-del-sobrino': TYPE_PROLOGUE,
    'el-camino-de-zuraldi-los-seguidores': TYPE_PROLOGUE,
    'el-camino-de-zuraldi-la-decision': TYPE_PROLOGUE,
}

# Title Fixes (slug -> title)
TITLE_FIXES_EN = {
    'magic-in-astalor': 'Magic in Astalor',
    'discovering-the-nexus': 'Discovering the Nexus',
}

TITLE_FIXES_ES = {
    'la-magia-en-astalor': 'La magia en Astalor',
    'descubriendo-las-regiones-de-astalor': 'Descubriendo las Regiones de Astalor',
    'descubriendo-el-nexus': 'Descubriendo el Nexus',
}

class Post:
    def __init__(self, path, frontmatter, content_remainder):
        self.path = path
        self.slug = os.path.basename(os.path.dirname(path))
        self.frontmatter = frontmatter
        self.content_remainder = content_remainder
        
        # Parse Category
        raw_cat = str(frontmatter.get('category', '')).strip().lower()
        if raw_cat in CATEGORY_PREFIXES:
            self.category_prefix = CATEGORY_PREFIXES[raw_cat]
        else:
            # Fallback based on known keys or default
            if 'umbra' in raw_cat: self.category_prefix = 'UMB'
            elif 'stone' in raw_cat: self.category_prefix = 'STO'
            elif 'astal' in raw_cat: self.category_prefix = 'AST'
            else: self.category_prefix = 'GEN' # Generic

        # Determine Taxonomy
        if self.slug in TAXONOMY_OVERRIDES:
            self.taxonomy = TAXONOMY_OVERRIDES[self.slug]
        else:
            title_lower = str(frontmatter.get('title', '')).lower()
            if any(x in title_lower for x in ["introducción", "contexto", "nota del autor", "resumen"]):
                 self.taxonomy = TYPE_META
            else:
                phase = str(frontmatter.get('canon_phase', '').lower().strip())
                # Debug logging
                if 'guard' in title_lower or 'amenaza' in title_lower:
                    print(f"DEBUG: Processing '{self.slug}' - Phase: '{phase}'")

                # If phase is Lore/Prequel, trust it. If Prologue/Main, check overlap.
                if phase == 'lore': self.taxonomy = TYPE_LORE
                elif phase == 'prequel': self.taxonomy = TYPE_PREQUEL
                elif phase == 'east': self.taxonomy = TYPE_PROLOGUE # East Prologue
                elif phase == 'prologue': self.taxonomy = TYPE_MAIN # Reclass old prologues to Main # Default to Main
                else: self.taxonomy = TYPE_MAIN
        
        # Double check alignment
        if 'east' in str(frontmatter.get('canon_phase', '')):
             self.taxonomy = TYPE_PROLOGUE
            
        self.type_str, self.canon_phase, self.type_code = self.taxonomy
        
        # Sort Keys
        self.type_rank = {TYPE_LORE: 10, TYPE_PREQUEL: 20, TYPE_PROLOGUE: 30, TYPE_MAIN: 40, TYPE_META: 99}[self.taxonomy]
        try:
            self.original_order = int(frontmatter.get('publication_order', 9999))
        except:
            self.original_order = 9999
        
    def update_metadata(self, new_order, new_date, new_sequence_id, lang):
        self.frontmatter['publication_order'] = new_order
        self.frontmatter['order'] = new_order # Add required field for Gatsby
        self.frontmatter['date'] = new_date
        self.frontmatter['type'] = self.type_str
        self.frontmatter['canon_phase'] = self.canon_phase
        self.frontmatter['canon_sequence'] = new_sequence_id
        
        # Fix Title if needed
        if lang == 'en' and self.slug in TITLE_FIXES_EN:
            self.frontmatter['title'] = TITLE_FIXES_EN[self.slug]
        if lang == 'es' and self.slug in TITLE_FIXES_ES:
            self.frontmatter['title'] = TITLE_FIXES_ES[self.slug]

    def write_back(self):
        with open(self.path, 'w', encoding='utf-8') as f:
            f.write('---\n')
            for k, v in self.frontmatter.items():
                if v is True: val = 'true'
                elif v is False: val = 'false'
                else: val = str(v)
                
                # Simple quoting for strings with colons
                if isinstance(v, str) and (':' in v or '#' in v) and not (v.startswith('"') or v.startswith("'")):
                    val = f'"{v}"'
                
                f.write(f'{k}: {val}\n')
            f.write('---\n')
            f.write(self.content_remainder)

def parse_mdx(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    match = re.search(r'^---\s+(.*?)\s+---', content, re.DOTALL)
    if not match:
        return None
    
    fm_text = match.group(1)
    remainder = content[match.end():]
    
    data = {}
    for line in fm_text.split('\n'):
        if ':' in line:
            key, val = line.split(':', 1)
            key = key.strip()
            val_str = val.strip().strip('"').strip("'")
            data[key] = val_str
            if val_str.lower() == 'true': data[key] = True
            elif val_str.lower() == 'false': data[key] = False
            
    return Post(file_path, data, remainder)

def process_language(lang):
    posts_dir = os.path.join(CONTENT_ROOT, lang)
    all_posts = []
    
    for root, dirs, files in os.walk(posts_dir):
        if "index.mdx" in files:
            post = parse_mdx(os.path.join(root, "index.mdx"))
            if post:
                all_posts.append(post)
                
    # Determinstic Sort
    all_posts.sort(key=lambda x: (x.type_rank, x.original_order))
    
    current_order = 101
    
    # Counters per (Prefix, TypeCode)
    # e.g. ('UMB', 'M') -> 1
    seq_counters = defaultdict(lambda: 1)
    
    for post in all_posts:
        if post.taxonomy == TYPE_META:
            # Meta posts get no order, no sequence ID, just type=meta
            # They don't increment current_order
            post.update_metadata(9999, (START_DATE + timedelta(days=999)).strftime('%Y-%m-%d'), "META", lang)
            post.write_back()
            continue

        # Generate new date
        offset = current_order - 100
        new_date = (START_DATE + timedelta(days=offset)).strftime('%Y-%m-%d')
        
        # Generate ID: PREFIX-TYPECODE-SEQ
        # e.g. UMB-M-001
        
        p = post.category_prefix
        t = post.type_code
        seq = seq_counters[(p, t)]
        new_id = f"{p}-{t}-{seq:03d}"
        
        # Increment sequence for this specific Arc+Type
        seq_counters[(p, t)] += 1
            
        post.update_metadata(current_order, new_date, new_id, lang)
        post.write_back()
        current_order += 1
        
    print(f"Processed {len(all_posts)} posts for {lang}")

if __name__ == "__main__":
    process_language('en')
    process_language('es')
