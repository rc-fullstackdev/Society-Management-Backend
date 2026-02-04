module.exports = ({
  societyName,
  secretaryName,
  residentName,
  month,
  amount,
  method,
  paymentDate,
  receiptNumber,
}) => {
  const formattedDate = new Date(paymentDate).toDateString();
  const formattedAmount = Number(amount).toLocaleString("en-IN");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Maintenance Invoice</title>
  <style>
    body {
      background: #f4f7fb;
      font-family: "Segoe UI", Arial, sans-serif;
      padding: 30px;
    }

    .invoice {
      max-width: 780px;
      margin: auto;
      background: #ffffff;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
    }

    .header {
      background: linear-gradient(135deg, #0ea5e9, #0284c7);
      color: white;
      padding: 28px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 0.3px;
    }

    .header p {
      margin: 6px 0 0;
      font-size: 14px;
      opacity: 0.95;
    }

    .content {
      padding: 28px;
      color: #1f2937;
    }

    .row {
      display: flex;
      justify-content: space-between;
      gap: 20px;
      flex-wrap: wrap;
    }

    .box {
      background: #f8fafc;
      border-radius: 10px;
      padding: 14px 16px;
      font-size: 14px;
      min-width: 220px;
    }

    .status {
      display: inline-block;
      background: #22c55e;
      color: white;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 14px;
    }

    h3 {
      margin-top: 26px;
      margin-bottom: 10px;
      font-size: 16px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      font-size: 14px;
    }

    table thead {
      background: #f1f5f9;
    }

    table th,
    table td {
      padding: 12px;
      border: 1px solid #e5e7eb;
    }

    table th {
      text-align: left;
      font-weight: 600;
    }

    table td:last-child,
    table th:last-child {
      text-align: right;
    }

    .total {
      margin-top: 18px;
      display: flex;
      justify-content: flex-end;
      font-size: 16px;
    }

    .total span {
      width: 200px;
      display: flex;
      justify-content: space-between;
      font-weight: 700;
    }

    .payment {
      margin-top: 24px;
      background: #eef7ff;
      border-left: 5px solid #0ea5e9;
      padding: 16px;
      border-radius: 10px;
      font-size: 14px;
    }

    .note {
      margin-top: 24px;
      font-size: 13px;
      color: #4b5563;
      line-height: 1.6;
    }

    .sign {
      margin-top: 30px;
      font-size: 14px;
    }

    .footer {
      background: #f9fafb;
      padding: 14px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
    }
  </style>
</head>

<body>
  <div class="invoice">
    <!-- HEADER -->
    <div class="header">
      <h1>${societyName}</h1>
      <p>Society Maintenance Invoice</p>
    </div>

    <!-- CONTENT -->
    <div class="content">
      <div class="row">
        <div class="box">
          <strong>Invoice No</strong><br />
          ${receiptNumber}
        </div>
        <div class="box">
          <strong>Invoice Date</strong><br />
          ${formattedDate}
        </div>
      </div>

      <div class="status">PAID</div>

      <h3>Bill To</h3>
      <div class="row">
        <div class="box">
          <strong>Resident Name</strong><br />
          ${residentName}
        </div>
        <div class="box">
          <strong>Billing Month</strong><br />
          ${month}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monthly Society Maintenance Charges</td>
            <td>${formattedAmount}</td>
          </tr>
        </tbody>
      </table>

      <div class="total">
        <span>
          <div>Total Paid</div>
          <div>₹ ${formattedAmount}</div>
        </span>
      </div>

      <div class="payment">
        <strong>Payment Details</strong><br /><br />
        Payment Method: ${method}<br />
        Payment Date: ${formattedDate}
      </div>

      <div class="note">
        This invoice confirms receipt of maintenance charges for the stated period.
        Please keep this invoice for future reference.
      </div>

      <div class="sign">
        Regards,<br />
        <strong>${secretaryName}</strong><br />
        ${societyName} Management
      </div>
    </div>

    <div class="footer">
      This is a system-generated invoice and does not require a signature.
    </div>
  </div>
</body>
</html>
`;
};
