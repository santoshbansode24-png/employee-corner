
import zipfile
import re
import os
import shutil

def fix_table():
    source = "template_fixed.docx"
    dest = "template_fixed_with_loop.docx"
    
    print(f"Opening {source}...")
    
    with zipfile.ZipFile(source, 'r') as zin:
        with zipfile.ZipFile(dest, 'w') as zout:
            for item in zin.infolist():
                buffer = zin.read(item.filename)
                
                if item.filename == 'word/document.xml':
                    xml_content = buffer.decode('utf-8')
                    
                    # Target: {{loop.index}}
                    # We want to prepend {% tr for receipt in medicine_receipts %}
                    # Be careful if {{loop.index}} is split across tags.
                    # Inspect tags showed clean {{loop.index}} but XML might be messy.
                    
                    # Regex to find potential split tags for {{loop.index}}
                    # Or simpler: The user template seems to have clean tags based on inspect.
                    # Let's try direct replacement first.
                    
                    tag_to_find = "{{loop.index}}"
                    loop_start = "{% tr for receipt in medicine_receipts %}"
                    
                    if tag_to_find in xml_content:
                        print(f"Found Clean '{tag_to_find}'. Injecting loop tag...")
                        new_xml = xml_content.replace(tag_to_find, loop_start + tag_to_find)
                    else:
                        print(f"'{tag_to_find}' not found as clean string. Trying regex for split tags...")
                        # Pattern: {{ followed by garbage then loop.index then garbage then }}
                        # e.g. <w:t>{{</w:t>...<w:t>loop.index</w:t>...<w:t>}}</w:t>
                        # This is risky with regex on full XML.
                        # Instead, let's look for "loop.index" and prepend to the start of that text node
                        
                        # Find the loop.index to locate the row
                        if "loop.index" in xml_content:
                            # We need to find the enclosing <w:tr ...> and </w:tr>
                            # 1. Find start of 'loop.index'
                            idx = xml_content.find("loop.index")
                            
                            # 2. Search backwards for <w:tr
                            # We scan backwards from idx
                            start_tr_idx = xml_content.rfind("<w:tr", 0, idx)
                            
                            # 3. Search forwards from idx for </w:tr>
                            end_tr_idx = xml_content.find("</w:tr>", idx)
                            
                            if start_tr_idx != -1 and end_tr_idx != -1:
                                print(f"Found row boundaries: Start {start_tr_idx}, End {end_tr_idx}")
                                
                                # We need to insert the loop BEFORE <w:tr> and AFTER </w:tr>
                                # But wait, <w:tr> closes with </w:tr>. The end_tr_idx finds the start of the closing tag.
                                # So end position is end_tr_idx + len("</w:tr>")
                                
                                end_tr_full = end_tr_idx + len("</w:tr>")
                                
                                row_content = xml_content[start_tr_idx:end_tr_full]
                                
                                # Clean up any existing partial tags inside if we added them previously?
                                # No, we are working on fresh extraction or we assume we backed up.
                                # But since we are modifying 'template_fixed.docx' which is the source...
                                # We should depend on the backup or ensure we don't double loop.
                                # Let's assume clean template state or just naive wrap (user can revert if needed).
                                
                                loop_start = "{% for receipt in medicine_receipts %}"
                                loop_end = "{% endfor %}"
                                
                                replacement = loop_start + row_content + loop_end
                                
                                # Replace the *entire* row with looped row
                                new_xml = xml_content[:start_tr_idx] + replacement + xml_content[end_tr_full:]
                                print("✅ Wrapped entire row in {% for ... %} loop.")
                                
                            else:
                                print("CRITICAL: Could not find enclosing <w:tr> tags.")
                                new_xml = xml_content
                        else:
                            print("CRITICAL: 'loop.index' not found in XML.")
                            new_xml = xml_content

                    zout.writestr(item, new_xml.encode('utf-8'))
                else:
                    zout.writestr(item, buffer)
                    
    print(f"Saved to {dest}")
    
    # Verify file creation
    if os.path.exists(dest):
        print(f"✅ Success: {dest} created.")
        # Attempt rename only if we can, else just leave it
        try:
             # backup = source + ".bak_auto"
             # if os.path.exists(backup): os.remove(backup)
             # os.rename(source, backup)
             # os.rename(dest, source)
             # print(f"Overwrote {source}")
             pass
        except Exception as e:
             print(f"Could not overwrite original (locked?): {e}")
             print(f"Please use {dest} manually or close the file.")
    else:
        print("Failed to create destination file.")

if __name__ == "__main__":
    fix_table()
