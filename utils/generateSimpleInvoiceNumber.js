const invoiceStore = {
    MT: { key: null, seq: 0 },
    FT: { key: null, seq: 0 }
};

const generateInvoiceNumber = (type = "MT") => {
    const now = new Date();

    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();

    const currentKey = `${month}${year}`;

    if (invoiceStore[type].key !== currentKey) {
        invoiceStore[type].key = currentKey;
        invoiceStore[type].seq = 1;
    } else {
        invoiceStore[type].seq += 1;
    }

    const seq = String(invoiceStore[type].seq).padStart(2, "0");

    return `${type}-${month}${year}${seq}`;
};

module.exports = generateInvoiceNumber;
