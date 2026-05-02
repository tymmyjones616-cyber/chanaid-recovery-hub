$db = "tanstack-start-db"
$exe = "npx wrangler d1 execute $db --remote --command"

function Run($sql) {
    & cmd /c "$exe `"$sql`""
}

Write-Host "=== Fixing blog posts ===" -ForegroundColor Cyan

# 1. Delete the fake placeholder blog-post-0 through blog-post-9 entries
Run "DELETE FROM blog_posts WHERE slug LIKE 'blog-post-%'"

# 2. Update the main named blog posts with real unique images, dates and authors
Run "UPDATE blog_posts SET author='Marcus Thorne, Head of Forensics', created_at='2026-03-10T09:15:00.000Z', featured_image='https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80' WHERE slug='how-to-recover-stolen-bitcoin-2026'"
Run "UPDATE blog_posts SET author='Elena Rodriguez, Legal Counsel', created_at='2026-03-14T14:22:00.000Z', featured_image='https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80' WHERE slug='pig-butchering-psychology'"
Run "UPDATE blog_posts SET author='James Okafor, Blockchain Analyst', created_at='2026-03-19T10:45:00.000Z', featured_image='https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80' WHERE slug='analysis-forex-broker-red-flags-a-legal-perspective'"
Run "UPDATE blog_posts SET author='Sarah Chen, Recovery Specialist', created_at='2026-03-25T08:30:00.000Z', featured_image='https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800&q=80' WHERE slug='analysis-nft-wash-trading-detecting-digital-fraud'"
Run "UPDATE blog_posts SET author='David Kowalski, Compliance Officer', created_at='2026-04-02T13:10:00.000Z', featured_image='https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80' WHERE slug='analysis-the-rise-of-ai-voice-scams-biometric-security'"
Run "UPDATE blog_posts SET author='Priya Patel, Cyber Fraud Investigator', created_at='2026-04-07T11:05:00.000Z', featured_image='https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80' WHERE slug='analysis-how-to-secure-your-metamask-institutional-grade'"
Run "UPDATE blog_posts SET author='Thomas Andersen, Senior Investigator', created_at='2026-04-11T15:40:00.000Z', featured_image='https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80' WHERE slug='analysis-chargeback-rights-2026-financial-justice'"
Run "UPDATE blog_posts SET author='Aisha Mohammed, Financial Crime Analyst', created_at='2026-04-15T09:55:00.000Z', featured_image='https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&q=80' WHERE slug='analysis-corporate-email-compromise-defending-your-business'"
Run "UPDATE blog_posts SET author='Robert Kim, Digital Asset Specialist', created_at='2026-04-19T12:20:00.000Z', featured_image='https://images.unsplash.com/photo-1528901166007-3784c7dd3653?w=800&q=80' WHERE slug='analysis-dating-app-fraud-from-emotion-to-investigation'"
Run "UPDATE blog_posts SET author='Claire Beaumont, International Recovery Lead', created_at='2026-04-23T10:00:00.000Z', featured_image='https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800&q=80' WHERE slug='analysis-the-truth-about-hyip-deconstructing-the-pyramid'"
Run "UPDATE blog_posts SET author='Marcus Thorne, Head of Forensics', created_at='2026-04-27T14:35:00.000Z', featured_image='https://images.unsplash.com/photo-1638913662252-70efce1e60a7?w=800&q=80' WHERE slug='analysis-recovery-loans-your-bridge-to-financial-justice'"
Run "UPDATE blog_posts SET author='Elena Rodriguez, Legal Counsel', created_at='2026-04-30T08:45:00.000Z', featured_image='https://images.unsplash.com/photo-1611926653458-09294b3142bf?w=800&q=80' WHERE slug='analysis-telegram-scam-groups-exposed-and-neutralized'"

# 3. Update all the bulk-inserted posts (different dates + images + authors)
Run "UPDATE blog_posts SET author='James Okafor, Blockchain Analyst', created_at='2026-01-08T10:00:00.000Z', featured_image='https://images.unsplash.com/photo-1516245834210-c4c142787335?w=800&q=80' WHERE slug='us-crypto-fraud-recovery'"
Run "UPDATE blog_posts SET author='Sarah Chen, Recovery Specialist', created_at='2026-01-15T13:30:00.000Z', featured_image='https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80' WHERE slug='uk-fake-trading-platform-recovery'"
Run "UPDATE blog_posts SET author='Thomas Andersen, Senior Investigator', created_at='2026-01-22T09:45:00.000Z', featured_image='https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80' WHERE slug='blockchain-forensics-tracing-coins'"
Run "UPDATE blog_posts SET author='Priya Patel, Cyber Fraud Investigator', created_at='2026-02-05T11:20:00.000Z', featured_image='https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=800&q=80' WHERE slug='canada-investment-fraud-recovery'"
Run "UPDATE blog_posts SET author='David Kowalski, Compliance Officer', created_at='2026-02-14T14:00:00.000Z', featured_image='https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80' WHERE slug='recovery-golden-hour-importance'"
Run "UPDATE blog_posts SET author='Aisha Mohammed, Financial Crime Analyst', created_at='2026-02-21T10:30:00.000Z', featured_image='https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80' WHERE slug='ethereum-defi-exploit-recovery'"
Run "UPDATE blog_posts SET author='Claire Beaumont, International Recovery Lead', created_at='2026-03-02T08:15:00.000Z', featured_image='https://images.unsplash.com/photo-1614064641938-3bbee52942c7?w=800&q=80' WHERE slug='spotting-fake-recovery-services'"
Run "UPDATE blog_posts SET author='Robert Kim, Digital Asset Specialist', created_at='2026-03-08T16:45:00.000Z', featured_image='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80' WHERE slug='recovery-success-stories-2026'"

Write-Host "=== Fixing service icons ===" -ForegroundColor Cyan
Run "UPDATE services SET icon='BlockchainForensics' WHERE slug='crypto-recovery'"
Run "UPDATE services SET icon='BlockchainForensics' WHERE slug='crypto-scam-recovery'"
Run "UPDATE services SET icon='LegalScale' WHERE slug='forex-scam-recovery'"
Run "UPDATE services SET icon='LegalScale' WHERE slug='investment-fraud-recovery'"
Run "UPDATE services SET icon='DigitalFingerprint' WHERE slug='romance-scam-recovery'"
Run "UPDATE services SET icon='AssetTrace' WHERE slug='asset-tracing'"
Run "UPDATE services SET icon='AssetTrace' WHERE slug='global-asset-tracing'"

Write-Host "=== Updating site settings ===" -ForegroundColor Cyan
Run "INSERT OR IGNORE INTO site_settings (id) VALUES (1)"
Run "UPDATE site_settings SET site_name='ChanAidRecovery Hub', contact_email='support@chanaidrecovery.com', whatsapp_number='+1 (940) 377-9359', telegram_username='ChanAidRecovery' WHERE id=1"

Write-Host "=== All done! ===" -ForegroundColor Green
