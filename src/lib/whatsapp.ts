export async function sendLowStockAlert(materialName: string, currentStock: number, adminName: string) {
    const message = `🚨 *LOW STOCK ALERT*\n\nAdmin: ${adminName}\nMaterial: *${materialName}*\nCurrent Stock: ${currentStock}\n\nPlease restock as soon as possible to avoid production delays.`;

    // TODO: Connect this to actual WhatsApp API provider (e.g., Twilio, WATI, Interakt)
    console.log("------------------- WHATSAPP STUB -------------------");
    console.log("SENDING WA MESSAGE:");
    console.log(message);
    console.log("-----------------------------------------------------");

    // Example API Call structure:
    // await fetch('https://api.whatsapp-provider.com/v1/messages', {
    //     method: 'POST',
    //     headers: { 'Authorization': `Bearer ${process.env.WA_API_KEY}` },
    //     body: JSON.stringify({ to: process.env.ADMIN_PHONE, text: message })
    // });
}
