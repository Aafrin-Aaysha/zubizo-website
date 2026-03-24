import fs from 'fs';
import path from 'path';

const rawText = `
Code : ZB-1001

Traditional Type invitations Pricing 
(Including Printing)

📩INVITATIONS INCLUDE
A4 Size (Two Folded Invite) + 
Ribbon

MAT FINISHING BOARD – 300 GSM (Budget Friendly)
50 - 100 Cards – ₹27/ card
200–399➝ ₹24/ card
400–599 ➝ ₹23/ card
600–799 ➝ ₹22/ card 
800–999 ➝ ₹21/ card
1000–1999 ➝ ₹20/ card

✨ PREMIUM BOARDS – 300 GSM
(Linen / Needle Point)

50 - 100 Cards – ₹35/ card
200–400 ➝ ₹33/ card
400–600 ➝ ₹30 / card
600–800 ➝ ₹28 / card
800–1000 ➝ ₹26 / card
1000–2000 ➝ ₹24 / card

----

Code : ZB_1002

Murugan Theme Traditional 
(Including Printing)

📩INVITATIONS INCLUDE
A4 Size (Two Folded Invite) + 
Ribbon

MAT FINISHING BOARD – 300 GSM (Budget Friendly)
50 - 100 Cards – ₹27/ card
200–399➝ ₹24/ card
400–599 ➝ ₹23/ card
600–799 ➝ ₹22/ card 
800–999 ➝ ₹21/ card
1000–1999 ➝ ₹20/ card

✨ PREMIUM BOARDS – 300 GSM
(Linen / Needle Point)

50 - 100 Cards – ₹35/ card
200–400 ➝ ₹33/ card
400–600 ➝ ₹30 / card
600–800 ➝ ₹28 / card
800–1000 ➝ ₹26 / card
1000–2000 ➝ ₹24 / card
`;

// Exact frontend parser
function parseDesignText(text, defaultCategoryId) {
    const designBlocks = text.includes('---') ? text.split(/\n---+\n/).filter(b => b.trim()) : [text];
    const designs = [];
    for (const block of designBlocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(l => l);
        if (lines.length === 0) continue;
        const design = {
            sku: '', name: '', description: '', categoryId: defaultCategoryId,
            minQuantity: 50, packages: [], images: [], isActive: true,
            isTrending: false, isFeatured: false,
        };
        let currentPackage = null;
        let parsingPriceTiers = false;
        let lookingForName = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const codeMatch = line.match(/^(?:Code|SKU)\s*[:：]?\s*(.+)/i);
            if (codeMatch) {
                design.sku = codeMatch[1].trim();
                lookingForName = true;
                continue;
            }
            if (lookingForName && !design.name && !line.match(/^(?:Code|Package|Included|Min|100\s*Cards|✨|🌿|📩|\(Including|Category|Description|Theme)/i)) {
                let cleanName = line.replace(/^\*+|\*+$/g, '').trim();
                const fallbackMatch = cleanName.match(/^(?:Name|Design Name|Invitation Name)\s*[:：]\s*(.+)/i);
                if (fallbackMatch) cleanName = fallbackMatch[1].trim();
                design.name = cleanName;
                lookingForName = false;
                continue;
            }
            const nameMatch = line.match(/^(?:Name|Design Name|Invitation Name)\s*[:：]\s*(.+)/i);
            if (nameMatch && !design.name) {
                design.name = nameMatch[1].trim();
                lookingForName = false;
                continue;
            }
            if (line.match(/^\(Including.*Print/i) || line.match(/^\(FIXED PRICE\)/i)) continue;
            const pkgMatch = line.match(/^(?:Package|📩\s*INVITATIONS INCLUDE)\s*[:：]?\s*(.+)?/i);
            if (pkgMatch) {
                if (currentPackage) design.packages.push(currentPackage);
                currentPackage = { title: pkgMatch[1] ? pkgMatch[1].trim() : 'Standard Package', inclusions: [], priceTiers: [] };
                parsingPriceTiers = false;
                continue;
            }
            const boardMatch = line.match(/^(?:🌿|✨)?\s*(MAT FINISHING|PREMIUM BOARDS|ACRYLIC|GLASS|VELLUM).*?-\s*(.*)/i) || 
                               line.match(/^(?:🌿|✨)\s*(.+)/i) ||
                               line.match(/^(MAT FINISHING|PREMIUM BOARDS).*?(?:\d+ GSM)/i);
            if (boardMatch) {
                if (currentPackage) {
                    if (currentPackage.priceTiers.length === 0) {
                        currentPackage.inclusions.push(line.replace(/^[🌿✨]\s*/, '').trim());
                        parsingPriceTiers = false;
                        continue;
                    }
                    design.packages.push(currentPackage);
                }
                currentPackage = { title: 'Standard Package', inclusions: [line.replace(/^[🌿✨]\s*/, '').trim()], priceTiers: [] };
                
                const boardStr = line.toLowerCase();
                let suffix = '';
                if (boardStr.includes('premium') || boardStr.includes('linen')) suffix = ' (Premium/Linen)';
                else if (boardStr.includes('mat finishing') || boardStr.includes('matt')) suffix = ' (Matte Board)';
                else if (boardStr.includes('acrylic')) suffix = ' (Acrylic)';
                else if (boardStr.includes('glass')) suffix = ' (Glass)';

                if (suffix) {
                    if (currentPackage.title && currentPackage.title !== 'Standard Package') {
                        if (!currentPackage.title.includes(suffix.replace(/[()]/g, ''))) currentPackage.title += suffix;
                    } else {
                        const base = boardStr.includes('premium') ? 'Premium Package' :
                                     boardStr.includes('matt') ? 'Budget Friendly Package' :
                                     boardStr.includes('acrylic') ? 'Luxury Package' : 'Standard Package';
                        currentPackage.title = base + suffix;
                    }
                }
                parsingPriceTiers = false;
                continue;
            }
            const incMatch = line.match(/^(?:Included|Includes|What's Included)\s*[:：]?\s*(.+)/i);
            if (incMatch) {
                if (!currentPackage) currentPackage = { title: 'Standard Package', inclusions: [], priceTiers: [] };
                currentPackage.inclusions.push(incMatch[1].trim());
                parsingPriceTiers = false;
                continue;
            }
            if (currentPackage && !parsingPriceTiers && line.length > 3 && !line.match(/^\d/) && !line.match(/^(?:Code|Name|Category|Description|Theme|Package|Min)/i)) {
                 currentPackage.inclusions.push(line.trim());
                 continue;
            }
            const singleQtyMatch = line.match(/^(\d+)\s*(?:Cards?|Pcs|Pieces)?\s*[-–—:]+\s*(?:₹?\s*)?(?:Rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:\/?\s*card)?/i);
            const rangeQtyMatch = line.match(/^(\d+)\s*[-–—to]+\s*(\d+)\s*(?:Cards?|Pcs)?\s*(?:➝|→|[-–—>:]+)\s*(?:₹?\s*)?(?:Rs\.?)?\s*(\d+(?:\.\d+)?)\s*(?:\/?\s*card)?/i);
            if (rangeQtyMatch) {
                if (!currentPackage) currentPackage = { title: 'Standard Package', inclusions: [], priceTiers: [] };
                currentPackage.priceTiers.push({ minQty: parseInt(rangeQtyMatch[1]), maxQty: parseInt(rangeQtyMatch[2]), pricePerCard: parseFloat(rangeQtyMatch[3]) });
                parsingPriceTiers = true;
                continue;
            } else if (singleQtyMatch) {
                if (!currentPackage) currentPackage = { title: 'Standard Package', inclusions: [], priceTiers: [] };
                const qty = parseInt(singleQtyMatch[1]);
                const prevTier = currentPackage.priceTiers[currentPackage.priceTiers.length - 1];
                if (prevTier && !prevTier.maxQty && qty > prevTier.minQty) prevTier.maxQty = qty - 1;
                currentPackage.priceTiers.push({ minQty: qty, maxQty: null, pricePerCard: parseFloat(singleQtyMatch[2]) });
                parsingPriceTiers = true;
                continue;
            }
            if (design.name && !currentPackage && !parsingPriceTiers && line.length > 5) {
                const catMatch = line.match(/^(?:Category|Type)\s*[:：]\s*(.+)/i);
                if (catMatch) continue;
                let cleanDesc = line;
                const descMatch = cleanDesc.match(/^(?:Description|About|Details|Theme)\s*[:：]\s*(.+)/i);
                if (descMatch) cleanDesc = descMatch[1].trim();
                
                if (!design.description) design.description = cleanDesc;
                else design.description += '\n' + cleanDesc;
            }
        }
        if (currentPackage) design.packages.push(currentPackage);
        let lowestMin = 999999;
        design.packages.forEach(p => p.priceTiers.forEach(t => { if (t.minQty < lowestMin) lowestMin = t.minQty; }));
        if (lowestMin !== 999999) design.minQuantity = lowestMin;
        if (design.sku || design.name || design.packages.length > 0) {
            if (!design.name && design.sku) design.name = `Design ${design.sku}`;
            if (!design.sku && design.name) design.sku = design.name.replace(/\s+/g, '_').toUpperCase().slice(0, 10);
            design.packages.forEach((pkg, index) => { if (!pkg.title) pkg.title = `Package Option ${index + 1}`; });
            designs.push(design);
        }
    }
    return designs;
}

// Upload file to local API endpoint which routes to Cloudinary
async function uploadImage(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const fileName = path.basename(filePath);
    const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', blob, fileName);
    
    const res = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
    });
    
    if (!res.ok) {
        throw new Error(`Upload failed: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.url;
}

async function run() {
    console.log("Fetching categories...");
    const catRes = await fetch('http://localhost:3000/api/categories');
    const categories = await catRes.json();
    const defaultCatId = categories[0]?._id;
    
    console.log("Parsing text...");
    const parsed = parseDesignText(rawText, defaultCatId);
    console.log(`Found ${parsed.length} designs in text.`);

    const catalogPath = path.join(process.cwd(), 'ZubizoArt_Catalog', 'South Indian Traditional');
    const files = fs.readdirSync(catalogPath);

    for (const design of parsed) {
        console.log(`Processing: ${design.sku} - ${design.name}`);
        
        // Find matching images: e.g. ZB-1001 matches ZB_1001.jpeg or ZB_1001(1).jpeg
        let normalizedSku = design.sku.replace(/-/g, '_').toUpperCase();
        // Since the text has ZB_1002 and ZB-1001, normalizedSku is ZB_1001 / ZB_1002
        
        const matchingFiles = files.filter(f => f.toUpperCase().startsWith(normalizedSku))
                                   .sort(); // sort ZB_1001(1) before ZB_1001(2)
        
        console.log(`  Found ${matchingFiles.length} images for ${normalizedSku}`);
        const uploadedUrls = [];
        for (const file of matchingFiles) {
            const filePath = path.join(catalogPath, file);
            console.log(`   Uploading ${file}...`);
            try {
                const url = await uploadImage(filePath);
                uploadedUrls.push(url);
                console.log(`   Uploaded! ${url}`);
            } catch (err) {
                console.error(`   Failed to upload ${file}:`, err);
            }
        }
        
        design.images = uploadedUrls;
        
        // Create design in DB
        console.log(`  Creating design in DB...`);
        const res = await fetch('http://localhost:3000/api/designs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(design)
        });
        
        if (res.ok) {
            console.log(`  ✅ Successfully created ${design.sku}`);
        } else {
            const err = await res.json();
            console.error(`  ❌ Failed to create ${design.sku}:`, err);
            
            // Delete previously created draft maybe to overcome SKU error if it exists?
            // "SKU already exists" error handling
            if (err.message && err.message.includes('already exists')) {
                console.log(`  ⚠️ SKU ${design.sku} exists. Skipping...`);
            }
        }
    }
    console.log("Automation complete!");
}

run().catch(console.error);
