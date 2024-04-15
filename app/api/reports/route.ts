import { Systeminformation } from "systeminformation";
import nodemailer from "nodemailer";

interface MemoryState {
  memMax: number;
  memSlots: number;
  memCurrent: number;
  memLayout: Systeminformation.MemLayoutData[];
  optLayout: {
    size: number;
    type: string;
  }[];
}

interface StorageState {
  total: number;
  used: number;
  available: number;
  diskLayout: Systeminformation.DiskLayoutData[];
  optDiskLayout: {
    extra: number;
    total: number;
  };
}

interface SystemState {
  cpu: string;
  winDist: string;
  cpuGen: number;
  status: number;
  optWinDist: string;
  optSystem: {
    windDist: string;
  };
}

interface BatteryState extends Systeminformation.BatteryData {
  optCapacity: number;
}

interface AppReport {
  memory: MemoryState;
  storage: StorageState;
  system: SystemState & Systeminformation.SystemData;
  battery: BatteryState;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, message } = body;
    // VALIDATION

    if (!name) {
      throw new Error("Invalid name field");
    }
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email field");
    }
    if (!phone || isNaN(+phone)) {
      throw new Error("Invalid phone field");
    }

    const { memory, storage, system, battery } = body as unknown as AppReport;

    if (!memory || !storage || !system || !battery) {
      throw new Error("Invalid report data");
    }
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GOOGLE_APP_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
    // const transport = nodemailer.createTransport(sgTransport(options));

    const getStatusAndColor = (current: number, max: number) => {
      const percentage = Math.trunc((current * 100) / max);
      const color =
        percentage < 50
          ? "darkred"
          : percentage >= 50 && percentage < 75
          ? "darkgoldenrod"
          : "darkgreen";
      const status =
        percentage < 50
          ? "LOW"
          : percentage >= 50 && percentage < 75
          ? "AVERAGE"
          : "HIGH";
      return { color, status };
    };

    const memStat = getStatusAndColor(memory.memCurrent, memory.memMax);

    const memoryRow = `
                       <tr>
                         <td>
                           <table style="width: 100%">
                             <thead>
                               <tr style="background: rgba(0, 0, 139, 0.2)">
                                 <th>
                                   <h4 style="color: darkblue"><b>MEMORY</b></h4>
                                 </th>
                               </tr>
                             </thead>
                             <tbody>
                               <tr>
                                 <td>
                                   <div style="background-color: rgba(169, 169, 169, 0.1)">
                                     <!-- OVERVIEW -->
                                     <div style="padding: 1rem 1rem">
                                       <h4 style="font-weight: bold">
                                         Computer's memory capability
                                       </h4>
                                       <ul style="margin-bottom: 4rem">
                                         <li>
                                           <p><b>Maximum memory</b>: ${
                                             memory.memMax
                                           }GB</p>
                                         </li>
                                         <li>
                                           <p><b>slots</b>: ${
                                             memory.memSlots
                                           } (${
      memory.memLayout.length
    } installed)</p>
                                         </li>
                                         <li>
                                           <p><b>Current memory</b>: ${
                                             memory.memCurrent
                                           }GB</p>
                                         </li>
                                         <li>
                                           <p>
                                             <b>Status</b>: ${
                                               memStat.color
                                             }% [<span
                                               style="color: ${
                                                 memStat.status
                                               }darkgoldenrod"
                                               >AVERAGE</span
                                             >
                                             performance]
                                           </p>
                                         </li>
                                       </ul>
                                     </div>
                                     <!-- SUGGESTIONS -->
                                     <table style="padding: 1rem 1rem; width: 100%">
                                       <thead>
                                         <tr>
                                           <th
                                             style="
                                               color: darkcyan;
                                               background: rgba(0, 139, 139, 0.2);
                                             "
                                           >
                                             Current Memory
                                           </th>
                                           <th
                                             style="
                                               color: darkgreen;
                                               background-color: rgba(0, 100, 0, 0.2);
                                             "
                                           >
                                             Recommended Upgrades
                                           </th>
                                         </tr>
                                       </thead>
                                       <tbody>
                                         <tr>
                                           <td>
                                             <p><b>Total size</b>: ${
                                               memory.memCurrent
                                             }GB</p>
                                             <table>
                                               <tr style="color: darkcyan">
                                                 <th>Slot 1</th>
                                                 <th>Slot 2</th>
                                               </tr>
                                               <tr>
                                                   ${(function () {
                                                     let memoryLayout = "";
                                                     memory.memLayout.forEach(
                                                       (ml) => {
                                                         memoryLayout +=
                                                           "<td><ul>";
                                                         memoryLayout +=
                                                           "<li><p><b>Size </b>: " +
                                                           ml.size +
                                                           "GB" +
                                                           "</p></li>";
                                                         memoryLayout +=
                                                           "<li><p><b>Bank </b>: " +
                                                           ml.bank +
                                                           "</p></li>";
                                                         memoryLayout +=
                                                           "<li><p><b>Manufacturer </b>: " +
                                                           ml.manufacturer +
                                                           "</p></li>";
                                                         memoryLayout +=
                                                           "<li><p><b>Part Number </b>: " +
                                                           ml.partNum +
                                                           "</p></li>";
                                                         memoryLayout +=
                                                           "<li><p><b>Type </b>: " +
                                                           ml.type +
                                                           "</p></li>";
                                                         memoryLayout +=
                                                           "</ul></td>";
                                                       }
                                                     );
                                                     return memoryLayout;
                                                   })()}
                                               </tr>
                                             </table>
                                           </td>
                                           <td>
                                             <p><b>Total size</b>: ${
                                               memory.memMax
                                             }GB</p>
                                             <table>
                                               <tr style="color: darkgreen">
                                                 <th>Slot 1</th>
                                                 <th>Slot 2</th>
                                               </tr>
                                               <tr>
                                               ${(function () {
                                                 let memoryLayout = "";
                                                 memory.optLayout.forEach(
                                                   (ml) => {
                                                     memoryLayout += "<td><ul>";
                                                     memoryLayout +=
                                                       "<li><p><b>Size </b>: " +
                                                       ml.size +
                                                       "GB" +
                                                       "</p></li>";
                                                     memoryLayout +=
                                                       "<li><p><b>Type </b>: " +
                                                       ml.type +
                                                       "</p></li>";
                                                     memoryLayout +=
                                                       "</ul></td>";
                                                   }
                                                 );
                                                 return memoryLayout;
                                               })()}
                                               </tr>
                                             </table>
                                           </td>
                                         </tr>
                                       </tbody>
                                     </table>
                                   </div>
                                 </td>
                               </tr>
                             </tbody>
                           </table>
                         </td>
                       </tr>
                       `;

    const storageStat = getStatusAndColor(storage.available, storage.total);
    const storageRow = `
                     <tr>
                       <td>
                         <table style="width: 100%">
                           <thead>
                             <tr style="background: rgba(0, 0, 139, 0.2)">
                               <th>
                                 <h4 style="color: darkblue"><b>STORAGE</b></h4>
                               </th>
                             </tr>
                           </thead>
                           <tbody>
                             <tr>
                               <td>
                                 <div style="background-color: rgba(169, 169, 169, 0.1)">
                                   <!-- OVERVIEW -->
                                   <div style="padding: 1rem 1rem">
                                     <h4 style="font-weight: bold">System Storage</h4>
                                     <ul style="margin-bottom: 4rem">
                                       <li>
                                         <p><b>Total Space</b>: ${
                                           storage.total
                                         }GB</p>
                                       </li>
                                       <li>
                                         <p><b>Used space</b>: ${
                                           storage.used
                                         }GB</p>
                                       </li>
                                       <li>
                                         <p><b>Available Space</b>: ${
                                           storage.available
                                         }GB</p>
                                       </li>
                                       <li>
                                         <p>
                                           <b>Status</b>: ${Math.trunc(
                                             (storage.available * 100) /
                                               storage.total
                                           )}% [<span
                                             style="color: ${
                                               storageStat.color
                                             }; font-weight: bold"
                                             >${storageStat.status}</span
                                           >
                                           performance]
                                         </p>
                                       </li>
                                     </ul>
                                   </div>
                                   <!-- SUGGESTIONS -->
                                   <table style="padding: 1rem 1rem; width: 100%">
                                     <thead>
                                       <tr>
                                         <th
                                           style="
                                             color: darkcyan;
                                             background: rgba(0, 139, 139, 0.2);
                                           "
                                         >
                                           Current Disk layout
                                         </th>
                                         <th
                                           style="
                                             color: darkgreen;
                                             background-color: rgba(0, 100, 0, 0.2);
                                           "
                                         >
                                           Recommended Upgrades
                                         </th>
                                       </tr>
                                     </thead>
                                     <tbody>
                                       <tr>
                                         <td>
                                           <p><b>Total drive</b>: ${
                                             storage.diskLayout.length
                                           }</p>
                                           <table>
                                             <tr>
                                               
                                                 ${(function () {
                                                   let diskLayout = "";
                                                   storage.diskLayout.forEach(
                                                     (storageL, idx) => {
                                                       diskLayout += "<td><ul>";
                                                       diskLayout +=
                                                         '<li style="list-style: none;color: darkcyan;"><p>Disk' +
                                                         (idx + 1) +
                                                         "</p></li>";
                                                       diskLayout +=
                                                         "<li><p><b>Size</b>: " +
                                                         storageL.size +
                                                         "GB" +
                                                         "</p></li>";
                                                       diskLayout +=
                                                         "<li><p><b>Interface type</b>: " +
                                                         storageL.interfaceType +
                                                         "</p></li>";
                                                       diskLayout +=
                                                         "<li><p><b>Type</b>: " +
                                                         storageL.type +
                                                         "</p></li>";
                                                       diskLayout +=
                                                         "<li><p><b>Name</b>: " +
                                                         storageL.name +
                                                         "</p></li>";
                                                       diskLayout +=
                                                         "</ul></td>";
                                                     }
                                                   );
                                                   return diskLayout;
                                                 })()}
                                             </tr>
                                           </table>
                                         </td>
                                         <td>
                                           <p><b>Total size</b>: ${
                                             storage.optDiskLayout.total
                                           }GB</p>
                                           <table>
                                             <tr>
                                               <td>
                                                 <ul>
                                                   <li>
                                                     <p><b>Upgrade Disk by</b>: ${
                                                       storage.optDiskLayout
                                                         .extra
                                                     }GB</p>
                                                   </li>
                                                   <li>
                                                     <p><b>Type</b>: SSD (if possible)</p>
                                                   </li>
                                                 </ul>
                                               </td>
                                             </tr>
                                           </table>
                                         </td>
                                       </tr>
                                     </tbody>
                                   </table>
                                 </div>
                               </td>
                             </tr>
                           </tbody>
                         </table>
                       </td>
                     </tr>
     `;
    const systemRow = `
                       <tr>
                         <td>
                           <table style="width: 100%">
                             <thead>
                               <tr style="background: rgba(0, 0, 139, 0.2)">
                                 <th>
                                   <h4 style="color: darkblue"><b>SYSTEM</b></h4>
                                 </th>
                               </tr>
                             </thead>
                             <tbody>
                               <tr>
                                 <td>
                                   <div style="background-color: rgba(169, 169, 169, 0.1)">
                                     <!-- OVERVIEW -->
                                     <div style="padding: 1rem 1rem">
                                       <h4 style="font-weight: bold">System information</h4>
                                       <ul style="margin-bottom: 4rem">
                                         <li>
                                           <p><b>CPU</b>: ${system.cpu}</p>
                                         </li>
                                         <li>
                                           <p><b>Generation</b>: ${
                                             system.cpuGen
                                           }th Gen</p>
                                         </li>
                                         <li>
                                           <p><b>Windows</b>: ${
                                             system.winDist
                                           }</p>
                                         </li>
                                         <li>
                                           <p>
                                             <b>Status</b>: ${
                                               system.status
                                             }% [<span
                                               style="color: ${
                                                 system.status < 50
                                                   ? "darkred"
                                                   : system.status >= 50 &&
                                                     system.status < 75
                                                   ? "darkgoldenrod"
                                                   : "darkgreen"
                                               }; font-weight: bold"
                                               >${
                                                 system.status < 50
                                                   ? "LOW"
                                                   : system.status >= 50 &&
                                                     system.status < 75
                                                   ? "AVERAGE"
                                                   : "HIGH"
                                               }</span
                                             >
                                             performance]
                                           </p>
                                         </li>
                                       </ul>
                                     </div>
                                     <!-- SUGGESTIONS -->
                                     <table style="padding: 1rem 1rem; width: 100%">
                                       <thead>
                                         <tr>
                                           <th
                                             style="
                                               color: darkcyan;
                                               background: rgba(0, 139, 139, 0.2);
                                             "
                                           >
                                             Current System info
                                           </th>
                                           <th
                                             style="
                                               color: darkgreen;
                                               background-color: rgba(0, 100, 0, 0.2);
                                             "
                                           >
                                             Recommended Upgrades
                                           </th>
                                         </tr>
                                       </thead>
                                       <tbody>
                                         <tr>
                                           <td>
                                             <p>${system.winDist}</p>
                                           </td>
                                           <td>
                                             <p>${system.optWinDist}</p>
                                           </td>
                                         </tr>
                                       </tbody>
                                     </table>
                                   </div>
                                 </td>
                               </tr>
                             </tbody>
                           </table>
                         </td>
                       </tr>
     `;

    const batteryStat = getStatusAndColor(
      battery.maxCapacity,
      battery.designedCapacity
    );
    const batteryRow = `
                       <tr>
                         <td>
                           <table style="width: 100%">
                             <thead>
                               <tr style="background: rgba(0, 0, 139, 0.2)">
                                 <th>
                                   <h4 style="color: darkblue"><b>BATTERY</b></h4>
                                 </th>
                               </tr>
                             </thead>
                             <tbody>
                               <tr>
                                 <td>
                                   <div style="background-color: rgba(169, 169, 169, 0.1)">
                                     <!-- OVERVIEW -->
                                     <div style="padding: 1rem 1rem">
                                       <h4 style="font-weight: bold">Battery information</h4>
                                       <ul style="margin-bottom: 4rem">
                                         <li>
                                           <p><b>Max designed capacity</b>: ${
                                             battery.designedCapacity
                                           } ${battery.capacityUnit}</p>
                                         </li>
                                         <li>
                                           <p><b>Current Max capacity</b>: ${
                                             battery.maxCapacity
                                           } ${battery.capacityUnit}</p>
                                         </li>
                                         <li>
                                           <p><b>Current capacity</b>: ${
                                             battery.currentCapacity
                                           } ${battery.capacityUnit}</p>
                                         </li>
                                         <li>
                                           <p>
                                             <b>Status</b>: ${Math.trunc(
                                               (battery.maxCapacity * 100) /
                                                 battery.designedCapacity
                                             )}% [<span
                                               style="color: ${
                                                 batteryStat.color
                                               }; font-weight: bold"
                                               >${batteryStat.status}</span
                                             >
                                             performance]
                                           </p>
                                         </li>
                                       </ul>
                                     </div>
                                     <!-- SUGGESTIONS -->
                                     <table style="padding: 1rem 1rem; width: 100%">
                                       <thead>
                                         <tr>
                                           <th
                                             style="
                                               color: darkcyan;
                                               background: rgba(0, 139, 139, 0.2);
                                             "
                                           >
                                             Current battery capacity
                                           </th>
                                           <th
                                             style="
                                               color: darkgreen;
                                               background-color: rgba(0, 100, 0, 0.2);
                                             "
                                           >
                                             Recommended Upgrades
                                           </th>
                                         </tr>
                                       </thead>
                                       <tbody>
                                         <tr>
                                           <td>
                                             <table>
                                               <tr>
                                                 <td>
                                                   <ul>
                                                     <li>
                                                       <p>
                                                         <b>Current Max capacity</b>: ${
                                                           battery.maxCapacity
                                                         } ${
      battery.capacityUnit
    }
                                                       </p>
                                                     </li>
                                                     <li>
                                                       <p><b>Model</b>: ${
                                                         battery.model
                                                       }</p>
                                                     </li>
                                                   </ul>
                                                 </td>
                                               </tr>
                                             </table>
                                           </td>
                                           <td>
                                             <p>
                                               ${
                                                 Math.trunc(
                                                   (battery.maxCapacity * 100) /
                                                     battery.designedCapacity
                                                 ) < 50 &&
                                                 "Critical condition !!! Battery need to be replaced"
                                               }
                                             </p>
                                             <table>
                                               <tr>
                                                 <td>
                                                   <ul>
                                                     <li>
                                                       <p>
                                                         <b>Max capacity</b>: ${
                                                           battery.designedCapacity
                                                         } ${
      battery.capacityUnit
    }
                                                       </p>
                                                     </li>
                                                   </ul>
                                                 </td>
                                               </tr>
                                             </table>
                                           </td>
                                         </tr>
                                       </tbody>
                                     </table>
                                   </div>
                                 </td>
                               </tr>
                             </tbody>
                           </table>
                         </td>
                       </tr>
     `;
    const mail = `
                 <div
                     style="
                       font-family: Verdana, Geneva, Tahoma, sans-serif;"
                   >
                     <br />
                     <h4 style="color: darkcyan"><strong>Problem Description</strong>:</h4>
                     <br />
                     <p style="color: black; opacity: 0.7">${message}</p>
                     <br />
                     <br />
                     <table style="width: 100%">
                       <!-- Computer manufacturer -->
                       <thead style="background: darkcyan; color: white">
                         <tr>
                           <th>
                             <h1>${system.manufacturer} ${system.model}</h1>
                           </th>
                         </tr>
                       </thead>
                       <tbody>
                       ${memoryRow}
                       ${storageRow}
                       ${systemRow}
                       ${battery.hasBattery && batteryRow}
                       </tbody>
                     </table>
                     <img
                       src="https://hamjambo-online-store.vercel.app/hare/IMG-20220915-WA0001.jpg"
                       height="150"
                       style="width: 100%; object-fit: contain"
                     />
                   </div>
     `;
    const adminMail =
      `
             <div style="font-family: Verdana, Geneva, Tahoma, sans-serif;">
             <img
               src="https://hamjambo-online-store.vercel.app/hare/IMG-20220915-WA0000.jpg"
               height="150"
               style="width: 100%; object-fit: contain"
               />
               <hr style="opacity: .2;" />
               <h4 style="color: black; opacity: .7;"><strong>Name</strong>: ${name}</h4>
               <h4 style="color: black; opacity: .7;"><strong>Phone Number</strong>: ${phone}</h4>
               <h4 style="color: black; opacity: .7;"><strong>Email address</strong>: ${email}</h4>
             </div>
   ` + mail;

    const userMail =
      `
                 <div style="font-family: Verdana, Geneva, Tahoma, sans-serif;">
                 <img
                 src="https://hamjambo-online-store.vercel.app/hare/IMG-20220915-WA0000.jpg"
                 height="150"
                 style="width: 100%; object-fit: contain"
               />
                   <hr style="opacity: .2;" />
                   <p style="color: black; opacity: .7;">Hujambo ${name}, <br />
                   Thank you for reaching out, We have listened.
                   <br /> <br /> Our team will reach out within the next 24 hours after reviewing your report.
                   <br /> Check below is the HARE app generated assessment for your computer.  </p>
                 </div>
        ` + mail;
    //send email to admin
    await transport.sendMail({
      from: `"hare" <hare@hamjambo.com>`, // user address
      //   to: "solutions@hamjambo.com", // admin receiver
      to: "paulsther@gmail.com", // admin receiver
      subject: "hare Report", // Subject line
      html: adminMail,
    });

    //send email to user
    await transport.sendMail({
      from: `"hare" <solutions@hamjambo.com>`, // user address
      to: email.trim(), // user receiver
      subject: "hare Report", // Subject line
      html: userMail,
    });

    return new Response("Report sent successfully", {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.log(error);
    throw new Error("Failed to send report");
  }
}
