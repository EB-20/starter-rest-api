const invoiceHtml = (orders) => {
  const [{ invoiceNo, createdAt, orderDetails, price }] = orders;
  console.log(price);
  return `<html>
<head>
    <meta charset="utf-8" />
    <title>EB Invoice PDF</title>
    <style>
html {
  -webkit-print-color-adjust: exact;
}
body{margin-top:20px;
  background-color: #f7f7ff;
  }
  #invoice {
      padding: 0px;
  }
  
  .invoice {
      position: relative;
      background-color: #FFF;
      min-height: 680px;
      padding: 15px
  }
  
  .invoice header {
      padding: 10px 0;
      margin-bottom: 20px;
      border-bottom: 1px solid #0d6efd
  }
  
  .invoice .company-details {
      text-align: right
  }
  
  .invoice .company-details .name {
      margin-top: 0;
      margin-bottom: 0
  }
  
  .invoice .contacts {
      margin-bottom: 20px
  }
  
  .invoice .invoice-to {
      text-align: left
  }
  
  .invoice .invoice-to .to {
      margin-top: 0;
      margin-bottom: 0
  }
  
  .invoice .invoice-details {
      text-align: right
  }
  
  .invoice .invoice-details .invoice-id {
      margin-top: 0;
      color: #0d6efd
  }
  
  .invoice main {
      padding-bottom: 50px
  }
  
  .invoice main .thanks {
      margin-top: -100px;
      font-size: 2em;
      margin-bottom: 50px
  }
  
  .invoice main .notices {
      padding-left: 6px;
      border-left: 6px solid #0d6efd;
      background: #e7f2ff;
      padding: 10px;
  }
  
  .invoice main .notices .notice {
      font-size: 1.2em
  }
  
  .invoice table {
      width: 100%;
      border-collapse: collapse;
      border-spacing: 0;
      margin-bottom: 20px
  }
  
  .invoice table td,
  .invoice table th {
      padding: 15px;
      background: #eee;
      border-bottom: 1px solid #fff
  }
  
  .invoice table th {
      white-space: nowrap;
      font-weight: 400;
      font-size: 16px
  }
  
  .invoice table td h3 {
      margin: 0;
      font-weight: 400;
      color: #0d6efd;
      font-size: 1.2em
  }
  
  .invoice table .qty,
  .invoice table .total,
  .invoice table .unit {
      text-align: right;
      font-size: 1.2em
  }
  
  .invoice table .no {
      color: #fff;
      font-size: 1.6em;
      background: #0d6efd
  }
  
  .invoice table .unit {
      background: #ddd
  }
  
  .invoice table .total {
      background: #0d6efd;
      color: #fff
  }
  
  .invoice table tbody tr:last-child td {
      border: none
  }
  
  .invoice table tfoot td {
      background: 0 0;
      border-bottom: none;
      white-space: nowrap;
      text-align: right;
      padding: 10px 20px;
      font-size: 1.2em;
      border-top: 1px solid #aaa
  }
  
  .invoice table tfoot tr:first-child td {
      border-top: none
  }
  .card {
      position: relative;
      display: flex;
      flex-direction: column;
      min-width: 0;
      word-wrap: break-word;
      background-color: #fff;
      background-clip: border-box;
      border: 0px solid rgba(0, 0, 0, 0);
      border-radius: .25rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 2px 6px 0 rgb(218 218 253 / 65%), 0 2px 6px 0 rgb(206 206 238 / 54%);
  }
  
  .invoice table tfoot tr:last-child td {
      color: #0d6efd;
      font-size: 1.4em;
      border-top: 1px solid #0d6efd
  }
  
  .invoice table tfoot tr td:first-child {
      border: none
  }
  
  .invoice footer {
      width: 100%;
      text-align: center;
      color: #777;
      border-top: 1px solid #aaa;
      padding: 8px 0
  }
  
  @media print {
      .invoice {
          font-size: 11px !important;
          overflow: hidden !important
      }
      .invoice footer {
          position: absolute;
          bottom: 10px;
          page-break-after: always
      }
      .invoice>div:last-child {
          page-break-before: always
      }
  }
  
  .invoice main .notices {
      padding-left: 6px;
      border-left: 6px solid #0d6efd;
      background: #e7f2ff;
      padding: 10px;
  }
    </style>
</head>

<body >
<div class="container">
<div class="card">
  <div class="card-body">
      <div id="invoice">
          <!--<div class="toolbar hidden-print">-->
          
       
          <!--</div>-->
          <div class="invoice overflow-auto">
              <div style="min-width: 600px">
                  <header>
                      <div class="row">
                          <div class="col">
                              <a href="javascript:;">
                      <img src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBw8PEg8RDw4OEBUQEBAQEA8QEBAQDxIQFRMZIhcTFRUYHSggGBolHRgXITEhJTUtLi4uGB8zODMsNzQtLisBCgoKDg0OGhAQFjclICE3NzE3NzUtLSstKy8xKzcwLSsrLDc3KysrKy8tLy0rKzUtNysrNS0tKy0tKzQtKzIrLf/AABEIAMIBBAMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABgcDBQgEAQL/xABREAACAgEBAgYNBQkOBwAAAAAAAQIDBBEFEgYHEyExUQgiNEFhcXJ0gZGSsbMUMlKh0hcjU1RigrTBwhY1QlVjc5OUlaKy0dPhFSQlM0SDo//EABoBAQADAAMAAAAAAAAAAAAAAAABBAUCAwb/xAApEQEAAgIBAgQFBQAAAAAAAAAAAQIDEQRRYQUSIUETMTORsRQjJNHw/9oADAMBAAIRAxEAPwC8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADybTzoY9dl1j0jXHefX4l1t9BMRv0RMxEblkysqFUXOycYRitZSk0opeNkQ2jxjY0G1RXZf+V/26/W+f6iFbV2rftO5KU4Vx1fJ1zsUKa4/Sk30vrfT1Et2FwJwNE7chZUu+oWKNa8Si9X6WX/0+LDG83rPSGVPLzZ7TGDUR1lueBvCWe0Fe51xr5OUUoxk5c0k+dtpd9Mkp4NmbJx8ZNUUwr3tN7dXPLTo1ff6We8pZJrNpmsaho4YvFIi87kABwdoAAAAAAAAAAAAAAAAAAAAAH4v+bLyX7j9mO/5svJfuA5Mhwgz9F/1DP8A65k/bNvwer23tGVkMPKz7ZVRUpr5fbDSLeifb2LXoIvX0LxFr9j53Tn+b0fEmEtZ+4zhV9PP/tRf6w/cZwq+nn/2ov8AWOhAEKk4tuDu3cbNjZtCWU6ORti1bmrIjyj3d3tOUl4efQtsAAAABBeNa+Sooguid2svDuxei9fP6CdGk4W7EWdRKtNRnFqdUn0KaT6fA02vSd3HvFMlbW+Svy6WvhtWvzazgJsij5FXKVddju1sm5RjLvtJc/Ulp6z35fA/Z9vTiVxf0q06n/d0IDsvb2bsmToupbhvNquesfG659DT6e/6CSVcZeNp22Pkp+Dk5L17yLOXBnm82p6xPvEqOHkcb4cUyRqY9phnt4IZFPbYO0civqruk7K/F4F6GeWXCXaODotoYqshrpy9Oi/29e6fbuMvGXzce9+U64r6pM193C3aGdGVeLgrdmnFycXatH+U9IL06k1xZZ+pWNd9RP3RfNgj6N530jcx9k+2TtKrKrjbTPejL0NPvxa7zR7SNcBtgzwaZRtknOyfKSinrGPapKOvffNzskpSyRWLTFZ3DSw2takTeNSAA4O0AAAAAAAAAAAAAAAAAAAx3/Nl5L9xkMd/zZeS/cBx3X0LxFr9j33Tn+b0fEmVRDoXiRa/Y9905/m9H+OYSvEBAIADxbU2tjYkVPKyKceMpbsZ3WRri5aN7qcn06J83gA9oI/+7fZH8a7P/rVH2j04fCnZ1z3adoYVj+jDJplL1KWoG3PjCYYGr2ntHCjLksm3Hi2lLk7nBJp66PSXiZ4q9mbIt541YM/I5J+4h3GpXpk0y+lRp7M3/mQpxXUjU4/C8+OLVvrbD5XiHw8s0tjidL2xdi4dfPXi48fDGuGvr0NgoJFecU1Pdc+996gurXtm/eiZZnCHBom6783DpmtG67cimuaTXM3GUtSjnpNMk1md6afFvGTHF4rrbZ6A1+z9uYeTJwx8zFvko7zhTfVbJR16WotvTnXP4TYHSsgPLtDaVGNFTyL6aItqKndZCqDk9dI6yaWvM+bwGTEy67oRspsrthJaxsrnGcJLXpUlzMDMAAAAAAAAAAAAAAAAAABjv+bLyX7jIfi/5svJfuA46h0LxFr9j33Tn+b0fEmVRX0LxEg4I8IM/Z87Z4EVKVkIxs1pldpFNtcy6OdhLqc+nPz4y+EX4KP9Qt/zNnwX4wNu35mJTfWlVbfXCx/I7IaQb5+2fR4whdxVnZBdx4fnq+BaWmirOyD7jw/PV8C0CouCOx45+bi4k5zrjfKcXOCi5R3apy5teb+Dp6Sf8JuJWyqqdmHkyyXCLk8e6uMZzS6VCcebXqTXP1oifFZ+++zv5y39HtOnQly/wK4c5ezJ1uNlluPquUxZSco8n33Un8ySXRpzPoZ03i5EbYQshJSjZGM4SXQ4yWqfqZyZwgjFZeaormWZlqKXQoq+ei9R0txeKS2Xsze11+RY/T1cmtPq0CEZ42q+2w5eC+P1w0/WQAsvjYr+840uq6Ufag3+yVoeg4E7wQ8p4nGuRZafFZRu4tkvwl8n6IxivemQvj/2Ho8XOhHp1xbml45VN/8A0XpiWNwCo3MHG/KUp+1NtfU0ZuG2xFtDCysbm3rK26n1XQe9W/aS9Gpi8i3my2nu9HxK+XBSOznXi/218g2hiXt6Qc+Ru6nVbzPXwJ7svzDqVM45lHpTTXSnF9KffTOieDXDWH/BFnXS3p4tLqtTaUp5FekYrxzbg/zzpWUM42M2zam08XZWPLmqnGEmudLIsWs5Pr5Ovn9MkXRs3Crx6qqao7sKa4Vwj1QitF7iouI3Y877svamRrKTnOqubXzrZveusXrUV45IuYIAAAAAAAAAAAAAAAAAAAMd/wA2Xkv3GQx3/Nl5L9wHHdfQvEWt2PndOf5vR8SZVNfQvEWv2PfdOf5vR8SYTK8T5ofQEBVnZB9x4fnq+BaWmVZ2QfceH56vgWgVbxd5tWPtPBuvshVXXOxzsm92EU6LEtX42l6S6+EfGjszHpnLHyqsq3dfJU0tzTnpzb8ktIx16W/RqUZwM2RXnZ2Ji2ysjC+c4ylW4qxKNU5Ldck10xXeLX2hxIYTg/k+ZmQno9128jbXr3t6MYRfqYTKqOCnB3I2rkxphvPelv5V+mirrcu3sb6FJ8+i778GrXVGNTGuEIQWkYRjCK6oxWiXqRzJh7W2nsDJtojZycq7Fy1Eu3xreZaS06nHTSS0emniOgeBXCeramNHIqW69XC6pvWVVq6Yt99c6affTQQ1vGhXrhxf0L63601+sqiTLi4w697Bv/JdUvVZEqPFq351w+nZCHtSS/Wbnh1v2Z7PN+K1/kR3heewsfksfGr+hTVH1QR7z8wWiS6j9GJM7nb0VI1WIc0ca+xPkW0r91aV5P8AzVfNovvjfKR9tSfikiPYeVkzq+Q0tyjkZNM1Uv4d+m7D0dsvZi+8XZx7bE5bDryox1lh2Jy0WrdFrUZehS3JeBJlJbC2m8PJxsqK3nj3QscdNd6KfbRXhcW16SHN1JwX2NDAxcfFr0aprUXLTTfm+ec34XJt+k2pjx7o2RjODUozjGcZLocZLVNegyBAAAAAAAAAAAAAAAAAAABjv+bLyX7jIY7/AJsvJfuA46r6F4i2Ox77pz/N6PiTKoh0LxFr9j53Tn+b0fEmErxAAQFWdkF3Hh+er4FpaZVvZBdx4fny+BaBWnFZ++2zv5y39HtOnTmLis/fbZ387b+j2nToTKkuyB2ao24OTFJOyFtFj773GnD6pzPDxC7TlXm34+r3cjHc9O9ylMlp/dnP1I3XZC5cdzZ9OvO533eiMYx/bfqInxK0ue1amuiujInLyd1R980BeXDGvewstdVM5eytf1FUcFKeUzMSP8tGXsay/ZLk21Vv4+RD6VNsfXBlWcW1O/m1v6FVs/qUf2jT4d9YMn+9mJz8fm5OLv8A2uBH0+I+WTUU22kkm23zJJdLZmNpVfHzwg5KinBrb3smSstS1b5Ct8y5vpT08e5JFK5+HZRZZTdBwsqk4WQfTGS7xY3BmL2/t2eVJa0Y8uWSfRyNT0x4eDel27Xgmfrj42JyWVTmRWkcqHJ2Nfh6lzN+GUNP6NgTfiT258p2fGmT7fCnyD8NWmtT8Wj3fzCwTnPia238l2jCuT0hmRdEupWLnqk/TrH/ANh0YgAAAAAAAAAAAAAAAAAAAGO/5svJfuMh+bI6prrTXrA45r6F4ixuJXbmJhX5k8vIqojOmqMHZLdUpKcm0vWiVLiNw/x/N9nH+wffuG4n4/m+zj/YCdpj90HY38Z4n9IPug7G/jPE/pEQ77h2H+P5vs4/2B9w7D/H832cf7AQnuyuFuzsuzksbNounuuW5XLelurpf1kG7IPuPD89XwLTb8D+LHH2XkrKrysi2SrnXu2KpR0npq+1iufmRuOHHBGra9VVNt1tSqtVylUoOTluSjp2ya00kwKA4tsqunamBZbZCuELLXOyyShCKdFiTcnzLnaXpOgM7h1smmLnLaWG9E3u1XQusenejCDbZC/uG4n4/m+zj/YP1DiOwte2zs1rqSx1+wBV3DzhPLamXPIcXCtJVUVy01jVFvnlpzbzbbenWlz6FtcS3BGzCpsysmEoW5SioVyWkq6E9VvLvSk+drvJR10epvuDvFzsvAkrKsd2WR5425EnbKLXfin2sX4UkyWpAfm6Oqa600VpxU433/Kl+DrhD2pP7BZsiG8XmLuPaL0/8yyv0Qb0/wARZxX1ivHXX5Us9PNnxz03+EzK+46eEPyTBdMJaWZrdMdHzqlL77L2Wo6/losEhPC/i8q2pk1ZGRlXKNUYQWPGMOTcFLWabfP23Q31adRWXWHib4PfI8CFk46WZjWRPXpVbX3qHs9tp1zZseM3YXy/Z+RXGOtla5enr5Svn3V5Ud6P5xKoRSSSSSS0SXMkuoMDjqq2UXGdcnGUXGcJrpjKLTjJeJpM6z4M7XhnYuNkw5lfVGbX0Zfwo+iSa9BX2bxJ4tlls45mRUrLJzVcYVOMFKTe7FvvLXReImXAngwtlUPGjkWXw5SVkHZGMXDe01it3vapy8cmBIgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB8Zq9hYfJK/+Uysiz2p/7G1PiRO3Ga7mJfQAQ5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/2Q==" width="80" alt="">
                  </a>
                          </div>
                          <div class="col company-details">
                              <h2 class="name">
                                  <a target="_blank" href="javascript:;">
           EBIX INSURETECH 
            </a>
                              </h2>
                              <div> MUMBAI INDIA</div>
                              <div>(+91) 9999999999</div>
                              <div>bseinsuretech@gmail.com</div>
                          </div>
                      </div>
                  </header>
                  <main>
                      <div class="row contacts">
                          <div class="col invoice-to">
                              <div class="text-gray-light">INVOICE NO:${invoiceNo}</div>
                              <h2 class="to">${orderDetails[0].orgName}</h2>
                              <div class="name">${
                                orderDetails[0].companyGstNumber
                              }</div>
                              <div class="address">${[
                                orderDetails[0].addressLine1,
                                orderDetails[0].addressLine2,
                                orderDetails[0].city,
                                orderDetails[0].state,
                                orderDetails[0].pincode,
                              ].join(",", "")}</div>
                              <div class="email"><a href="mailto:${
                                orderDetails[0].eMail
                              }">${orderDetails[0].eMail}</a>
                              </div>
                          </div>
                          <div class="col invoice-details">
                              <h1 class="invoice-id">INVOICE 3-2-1</h1>
                              <div class="date">Date of Invoice: ${new Date(
                                createdAt
                              ).toDateString()}</div>
                              
                          </div>
                      </div>
                      <table>
                          <thead>
                              <tr>
                                  <th  class="text-left">S.NO.</th>
                                  <th class="text-left">Age-Band</th>
                                  <th class="text-right">PRICE</th>
                                  <th class="text-right">COUNT</th>
                                  <th class="text-right">TOTAL</th>
                              </tr>
                              
                          </thead>
                          <tbody>
                           ${Object.keys(orderDetails[0].empAgeCount).map(
                             (key, index) => {
                               return `<tr>
                            <td class="no">${index + 1}</td>
                              <td class="text-right">${key}</td>
                            <td class="unit">${
                              price.find(
                                (items) => items.dataValues.ageBand === key
                              )[orderDetails[0].planType]
                            }</td>
                            <td class="qty">${
                              orderDetails[0].empAgeCount[key]
                            }</td>
                            <td class="total">₹ ${
                              Number(
                                price.find(
                                  (items) => items.dataValues.ageBand === key
                                )[orderDetails[0].planType]
                              ) * Number(orderDetails[0].empAgeCount[key])
                            }</td>
                        </tr>`;
                             }
                           )}

                          
                          </tbody>
                          <tfoot>
                              <tr>
                                  <td colspan="2"></td>
                                  <td colspan="2">SUBTOTAL ${
                                    {
                                      monthlyPrice: "1 Month",
                                      quarterlyPrice: "4 Month",
                                      annuallyPrice: "12 Month",
                                      halfYearlyPrice: "6 Month",
                                    }[orderDetails[0].planType]
                                  }</td>
                                  <td>₹ ${orderDetails[0].totalPlanPrice}</td>
                              </tr>
                              <tr>
                                  <td colspan="2"></td>
                                  <td colspan="2">TAX 18%</td>
                                  <td>₹ ${(
                                    orderDetails[0].totalPlanPrice * 0.18
                                  ).toFixed(0)}</td>
                              </tr>
                              <tr>
                                  <td colspan="2"></td>
                                  <td colspan="2">GRAND TOTAL</td>
                                  <td>₹ ${(
                                    orderDetails[0].totalPlanPrice * 0.18 +
                                    orderDetails[0].totalPlanPrice
                                  ).toFixed(0)}</td>
                              </tr>
                          </tfoot>
                      </table>
                      <div class="thanks">Thank you!</div>
                      <!--<div class="notices">-->
                      <!--    <div>NOTICE:</div>-->
                      <!--    <div class="notice">A finance charge of 1.5% will be made on unpaid balances after 30 days.</div>-->
                      <!--</div>-->
                      
                          <div class="row">
                          <div class="col">
                             
                              </div>
                             </div>
                                  
                      
                  </main>
                  <footer>Invoice was created on a computer and is valid without the signature and seal.</footer>
              </div>
              <!--DO NOT DELETE THIS div. IT is responsible for showing footer always at the bottom-->
              <div></div>
          </div>
      </div>
  </div>
</div>
</div>
</body>
</html>`;
};
module.exports = { invoiceHtml };
