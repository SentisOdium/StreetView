import { useState, useEffect } from "react";
import axios from "axios";
import type { NodeObj } from "../objects/NodeObj";
// Define types according to your backend
interface Image {
  src: string;
  alt: string;
}

interface CurrentNode {
  id: number;
  currentNode_name: string;
  coordinates: string;
  img: Image;
}

interface HotspotCoordinates {
  node_Coordinates: string;
  node_Direction: string;
}

interface Hotspot {
  node_id: number;
  currentNode_id: number;
  hotspot_name: string;
  coordinates: HotspotCoordinates;
}

interface RoomSprite {
  room_number: number;
  room_type: string;
  room_img: string;
  room_description: string;
}

interface NodeData {
  Current: CurrentNode;
  Hotspots: Hotspot[];
  Room_Sprite: RoomSprite[];
}

export default function NodeComponent() {
  const [nodeData, setNodeData] = useState<NodeData | null>(null);

  let currNode = 1;
  useEffect(() => {
    const fetchNodeData = async () => {
      const response = await axios.get<{ Node: NodeData }>(
        "http://localhost:5000/api/hotspots/4"
      );
      setNodeData(response.data.Node); // <-- Access the "Node" object
    };

    fetchNodeData();
  }, []);

  if (!nodeData) return <div>Loading...</div>;

  return (
    <div>
      <h2>Current Node: {nodeData.Current.id}</h2>
      <p>Name: {nodeData.Current.currentNode_name}</p>
      <img src={nodeData.Current.img.src} alt={nodeData.Current.img.alt} />
    <br />   <br />
      {nodeData.Hotspots.map((hotspot) => (
        <div key={hotspot.node_id}>
          <p className="font-bold">H.name {hotspot.hotspot_name}</p>
          <p className="font-bold">Coordinates: {hotspot.coordinates.node_Coordinates}</p>
          <p className="font-bold">Direction: {hotspot.coordinates.node_Direction}</p>
        </div>
      ))}
   <br />   <br />
      <h2>Rooms:</h2>
      {nodeData.Room_Sprite.map((room) => (
        <div key={room.room_number}>
          <p>room: {room.room_type} - Room {room.room_number}</p>
          <p>Description: {room.room_description}</p>
        </div>
      ))}
    </div>
  );
}
