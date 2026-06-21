const fs = require('fs');
const path = 'src/app/admin/designs/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Find '                            </div>\n                        </motion.div>\n                    </div>'
const target = '                            </div>\n                        </motion.div>\n                    </div>';
const index = content.indexOf('                            </div>\r\n                        </motion.div>\r\n                    </div>');

if (index !== -1) {
    const fixedEnd =                             </div>\n                        </motion.div>\n                    </div>\n                )}\n            </AnimatePresence>\n        </div>\n    );\n}\n\nfunction Check({ size, className }: { size: number; className?: string }) {\n    return (\n        <svg\n            width={size}\n            height={size}\n            viewBox="0 0 24 24"\n            fill="none"\n            stroke="currentColor"\n            strokeWidth="3"\n            strokeLinecap="round"\n            strokeLinejoin="round"\n            className={className}\n        >\n            <path d="M20 6 9 17l-5-5" />\n        </svg>\n    );\n}\n;

    content = content.substring(0, index) + fixedEnd;
    fs.writeFileSync(path, content, 'utf8');
    console.log("Fixed designs page");
} else {
    // try \n
    const idx2 = content.indexOf(target);
    if (idx2 !== -1) {
        const fixedEnd =                             </div>\n                        </motion.div>\n                    </div>\n                )}\n            </AnimatePresence>\n        </div>\n    );\n}\n\nfunction Check({ size, className }: { size: number; className?: string }) {\n    return (\n        <svg\n            width={size}\n            height={size}\n            viewBox="0 0 24 24"\n            fill="none"\n            stroke="currentColor"\n            strokeWidth="3"\n            strokeLinecap="round"\n            strokeLinejoin="round"\n            className={className}\n        >\n            <path d="M20 6 9 17l-5-5" />\n        </svg>\n    );\n}\n;

        content = content.substring(0, idx2) + fixedEnd;
        fs.writeFileSync(path, content, 'utf8');
        console.log("Fixed designs page with \\n");
    } else {
        console.log("Could not find target");
    }
}
