#!/usr/bin/env python3
"""
Extract summaries, key points, and quotes from Lenny's Podcast transcripts.
Generates a summaries.js file for the website.
"""

import os
import re
import json
import textwrap

BASE_DIR = "/Users/xcao/Downloads/Lenny's Podcast Transcripts Archive [public]"
OUTPUT_FILE = os.path.join(BASE_DIR, "website", "summaries.js")

# Skip non-episode files
SKIP_FILES = {
    'transcript_categories.md', 'EOY Review.txt', 'Teaser_2021.txt',
    'Interview Q Compilation.txt', 'Failure.txt', '.DS_Store'
}


def parse_transcript(filepath):
    """Parse a transcript file into structured segments."""
    with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
        text = f.read()
    
    # Parse into speaker segments
    # Pattern: Speaker Name (HH:MM:SS):
    pattern = r'^([^\n]+?)\s*\((\d{2}:\d{2}:\d{2})\):\s*$'
    segments = []
    lines = text.split('\n')
    current_speaker = None
    current_time = None
    current_text = []
    
    for line in lines:
        line = line.strip('\r')
        match = re.match(pattern, line)
        if match:
            # Save previous segment
            if current_speaker and current_text:
                full_text = ' '.join(current_text).strip()
                if full_text:
                    segments.append({
                        'speaker': current_speaker.strip(),
                        'time': current_time,
                        'text': full_text
                    })
            current_speaker = match.group(1)
            current_time = match.group(2)
            current_text = []
        else:
            if line.strip():
                current_text.append(line.strip())
    
    # Save last segment
    if current_speaker and current_text:
        full_text = ' '.join(current_text).strip()
        if full_text:
            segments.append({
                'speaker': current_speaker.strip(),
                'time': current_time,
                'text': full_text
            })
    
    return segments


def identify_guest_name(segments, filename):
    """Identify the guest's name from the transcript."""
    basename = os.path.splitext(filename)[0]
    # Remove version suffixes
    basename = re.sub(r'\s*\d+\.\d+$', '', basename)
    basename = re.sub(r'_$', '', basename)
    return basename


def find_lenny_intro(segments):
    """Find Lenny's introduction of the episode (his overview)."""
    intro_parts = []
    for seg in segments:
        # Lenny's intro usually mentions "Today my guest is" or "my guest is"
        speaker_lower = seg['speaker'].lower()
        if ('lenny' in speaker_lower or speaker_lower.startswith('(')) and seg['time'] < '00:06:00':
            text = seg['text']
            # Check if this is the intro (mentions "guest", "conversation", "episode")
            if any(kw in text.lower() for kw in ['today my guest', 'my guest is', 'in our conversation', 
                                                   'what you\'ll learn', 'in this episode', 'we covered',
                                                   'we get into', 'we talk about', 'we discuss',
                                                   'this is one of', 'we dive into', 'this episode']):
                intro_parts.append(text)
    return ' '.join(intro_parts)


def extract_guest_quotes(segments, guest_name_parts):
    """Extract notable quotes from the guest (non-Lenny speakers)."""
    quotes = []
    
    for seg in segments:
        speaker = seg['speaker']
        # Skip Lenny, timestamps-only, and sponsor segments
        if 'lenny' in speaker.lower() or speaker.startswith('('):
            continue
        
        text = seg['text']
        
        # Skip very short or very long segments
        if len(text) < 60 or len(text) > 600:
            continue
        
        # Skip sponsor/ad content
        if any(kw in text.lower() for kw in ['brought to you by', 'this episode is', 'sponsor', 
                                               'check out', 'promo code', 'dot com slash']):
            continue
        
        # Score the quote for quality
        score = 0
        
        # Prefer quotes with strong opinion markers
        opinion_markers = ['i think', 'i believe', 'the key is', 'the most important', 
                          'the secret', 'the biggest', 'what i learned', 'the truth is',
                          'here\'s what', 'the way i think about', 'the lesson',
                          'my advice', 'the reason', 'fundamentally', 'the mistake',
                          'the best', 'the worst', 'what people don\'t', 'counterintuitive',
                          'the reality is', 'the problem with', 'the thing that',
                          'one of the biggest', 'the number one', 'if i could',
                          'the single most', 'the real', 'people underestimate',
                          'the critical', 'the surprising']
        
        text_lower = text.lower()
        for marker in opinion_markers:
            if marker in text_lower:
                score += 2
        
        # Prefer medium-length quotes (100-400 chars)
        if 100 <= len(text) <= 400:
            score += 3
        elif 80 <= len(text) <= 500:
            score += 1
        
        # Prefer quotes that are complete sentences
        if text.endswith('.') or text.endswith('!') or text.endswith('"'):
            score += 1
        
        # Penalize quotes that start with "..." or "And"
        if text.startswith('...') or text.startswith('And ') or text.startswith('So '):
            score -= 1
        
        # Prefer quotes from the meat of the conversation (not very beginning or end)
        if seg['time'] > '00:10:00' and seg['time'] < '00:55:00':
            score += 1
        
        if score >= 3:
            quotes.append({
                'text': text,
                'speaker': speaker,
                'score': score
            })
    
    # Sort by score, take top quotes
    quotes.sort(key=lambda q: q['score'], reverse=True)
    return quotes[:8]  # Return top 8 candidates


def generate_summary(intro_text, guest_name, top_quotes, segments):
    """Generate a summary from the intro and content."""
    # Clean up intro text - remove sponsor content
    if intro_text:
        # Remove sponsor sections
        sponsor_patterns = [
            r'This episode is brought to you by.*?(?=In our|What you|Today|$)',
            r'Brought to you by.*?(?=In our|What you|Today|$)',
        ]
        for pat in sponsor_patterns:
            intro_text = re.sub(pat, '', intro_text, flags=re.DOTALL | re.IGNORECASE)
        
        # Clean up
        intro_text = re.sub(r'\s+', ' ', intro_text).strip()
    
    # Build summary from intro
    summary = intro_text if intro_text else ''
    
    # If summary is too long, truncate to first 2-3 sentences
    if len(summary) > 800:
        sentences = re.split(r'(?<=[.!?])\s+', summary)
        summary = ' '.join(sentences[:4])
    
    # If no intro found, build from first few guest segments
    if not summary or len(summary) < 50:
        guest_texts = []
        for seg in segments[1:10]:  # Skip first segment (usually hook)
            if 'lenny' not in seg['speaker'].lower() and not seg['speaker'].startswith('('):
                guest_texts.append(seg['text'])
            if len(' '.join(guest_texts)) > 400:
                break
        if guest_texts:
            summary = f"In this episode, {guest_name} discusses: {guest_texts[0]}"
            if len(summary) > 600:
                sentences = re.split(r'(?<=[.!?])\s+', summary)
                summary = ' '.join(sentences[:3])
    
    return summary


def extract_key_points(intro_text, segments, guest_name):
    """Extract key points/takeaways from the episode."""
    key_points = []
    
    # Look for numbered lists in Lenny's intro
    if intro_text:
        # Find numbered items
        numbered = re.findall(r'(?:^|\s)(\d+)\.\s+(.+?)(?=\s+\d+\.|$)', intro_text)
        for num, point in numbered:
            point = point.strip()
            if len(point) > 20 and len(point) < 200:
                key_points.append(point)
    
    # If we didn't find numbered points, extract from guest's key statements
    if len(key_points) < 3:
        for seg in segments:
            if 'lenny' in seg['speaker'].lower() or seg['speaker'].startswith('('):
                continue
            text = seg['text']
            # Look for strong declarative statements
            for sentence in re.split(r'(?<=[.!])\s+', text):
                sentence = sentence.strip()
                if len(sentence) < 30 or len(sentence) > 200:
                    continue
                lower = sentence.lower()
                if any(kw in lower for kw in ['the key is', 'the most important', 'i think the',
                                                'the lesson', 'what i learned', 'my advice',
                                                'the biggest mistake', 'the secret', 'the best way',
                                                'fundamentally', 'the number one', 'the real',
                                                'the thing that', 'people should', 'you need to',
                                                'the framework', 'the principle', 'the way to']):
                    if sentence not in key_points:
                        key_points.append(sentence)
                    if len(key_points) >= 5:
                        break
            if len(key_points) >= 5:
                break
    
    # If still not enough, extract topic-based points from Lenny's intro
    if len(key_points) < 3 and intro_text:
        # Look for "including" clauses
        including_match = re.search(r'(?:including|covered|discussed|talked about|get into)\s+(.+?)(?:\.|$)', 
                                     intro_text, re.IGNORECASE)
        if including_match:
            items = re.split(r',\s*(?:and\s+)?|;\s*', including_match.group(1))
            for item in items:
                item = item.strip()
                if len(item) > 10 and len(item) < 200:
                    key_points.append(item.capitalize() if item[0].islower() else item)
    
    # Deduplicate and limit
    seen = set()
    unique_points = []
    for p in key_points:
        normalized = p.lower().strip('.')
        if normalized not in seen:
            seen.add(normalized)
            unique_points.append(p)
    
    return unique_points[:5]


def process_transcript(filepath):
    """Process a single transcript file and return structured data."""
    filename = os.path.basename(filepath)
    guest_name = identify_guest_name([], filename)
    
    segments = parse_transcript(filepath)
    if not segments:
        return None
    
    intro_text = find_lenny_intro(segments)
    top_quotes = extract_guest_quotes(segments, guest_name.split())
    summary = generate_summary(intro_text, guest_name, top_quotes, segments)
    key_points = extract_key_points(intro_text, segments, guest_name)
    
    # Pick best 2 quotes
    selected_quotes = []
    for q in top_quotes[:2]:
        # Truncate overly long quotes
        quote_text = q['text']
        if len(quote_text) > 500:
            sentences = re.split(r'(?<=[.!?])\s+', quote_text)
            quote_text = ' '.join(sentences[:3])
        selected_quotes.append({
            'text': quote_text,
            'speaker': q['speaker']
        })
    
    return {
        'name': guest_name,
        'summary': summary,
        'keyPoints': key_points,
        'quotes': selected_quotes
    }


def main():
    all_summaries = {}
    
    # Process all .txt files in the base directory
    txt_files = []
    for f in sorted(os.listdir(BASE_DIR)):
        if f.endswith('.txt') and f not in SKIP_FILES:
            txt_files.append(os.path.join(BASE_DIR, f))
    
    # Also check subdirectories for any files not in root
    for d in sorted(os.listdir(BASE_DIR)):
        subdir = os.path.join(BASE_DIR, d)
        if os.path.isdir(subdir) and d.startswith(('0', '1')):
            for f in sorted(os.listdir(subdir)):
                if f.endswith('.txt') and f not in SKIP_FILES:
                    full_path = os.path.join(subdir, f)
                    # Check if we already have this file from root
                    if full_path not in txt_files:
                        basename = os.path.basename(full_path)
                        root_version = os.path.join(BASE_DIR, basename)
                        if root_version not in txt_files:
                            txt_files.append(full_path)
    
    print(f"Processing {len(txt_files)} transcripts...")
    
    success = 0
    errors = 0
    for filepath in txt_files:
        filename = os.path.basename(filepath)
        try:
            result = process_transcript(filepath)
            if result:
                all_summaries[result['name']] = {
                    'summary': result['summary'],
                    'keyPoints': result['keyPoints'],
                    'quotes': result['quotes']
                }
                success += 1
                if success % 50 == 0:
                    print(f"  Processed {success}...")
        except Exception as e:
            print(f"  Error processing {filename}: {e}")
            errors += 1
    
    print(f"Done! Processed {success} transcripts, {errors} errors.")
    
    # Write output as JavaScript
    js_content = "// Auto-generated podcast summaries, key points, and quotes\n"
    js_content += "// Extracted from transcript files\n\n"
    js_content += "const GUEST_SUMMARIES = "
    
    # Use json.dumps for proper escaping, then make it valid JS  
    json_str = json.dumps(all_summaries, indent=2, ensure_ascii=False)
    js_content += json_str + ";\n"
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"Wrote summaries to {OUTPUT_FILE}")
    print(f"File size: {os.path.getsize(OUTPUT_FILE)} bytes")


if __name__ == '__main__':
    main()
