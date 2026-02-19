// import React from 'react';
// import type  { NodeObj } from './components/objects/NodeObj';
// interface NodeTableProps {
//   nodeData: NodeObj;
// }

// const NodeTable: React.FC<NodeTableProps> = ({ nodeData }) => {
//   return (
//     <div>
//       {/* Current Node Table */}
//       <h2>Current Node</h2>
//       <table border={1} cellPadding={5} cellSpacing={0}>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Name</th>
//             <th>Coordinates</th>
//             <th>Image</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>{nodeData.current_node.id}</td>
//             <td>{nodeData.current_node.currentNode_name}</td>
//             <td>{nodeData.current_node.coordinates}</td>
//             <td>
//               <img
//                 src={nodeData.current_node.img.src}
//                 alt={nodeData.current_node.img.alt}
//                 width={50}
//               />
//             </td>
//           </tr>
//         </tbody>
//       </table>

//       {/* Hotspots Table */}
//       <h2>Hotspots</h2>
//       <table border={1} cellPadding={5} cellSpacing={0}>
//         <thead>
//           <tr>
//             <th>Node ID</th>
//             <th>Name</th>
//             <th>Coordinates</th>
//             <th>Direction</th>
//           </tr>
//         </thead>
//         <tbody>
//           {nodeData.hotspots.map((h) => (
//             <tr key={h.node_id}>
//               <td>{h.node_id}</td>
//               <td>{h.hotspot_name}</td>
//               <td>{h.hotspot_coordinates.node_coordinates}</td>
//               <td>{h.hotspot_coordinates.node_direction}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Room Sprites Table */}
//       <h2>Room Sprites</h2>
//       <table border={1} cellPadding={5} cellSpacing={0}>
//         <thead>
//           <tr>
//             <th>Room Number</th>
//             <th>Type</th>
//             <th>Image</th>
//             <th>Description</th>
//           </tr>
//         </thead>
//         <tbody>
//           {nodeData.room_sprites.map((r) => (
//             <tr key={r.room_number}>
//               <td>{r.room_number}</td>
//               <td>{r.room_type}</td>
//               <td>{r.room_img}</td>
//               <td>{r.room_description}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default NodeTable;
