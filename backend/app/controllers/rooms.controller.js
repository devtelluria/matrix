import fs from "fs";
import uuid from "uuid/v4";
import path from "path";

const roomFilePath = "../file/matrix.room.web.json";

const fetchFromFile = () => {
  const roomFileExists = fs.existsSync(roomFilePath);
  if (!roomFileExists) {
    createRoomFileSync();
  }

  const roomsData = fs.readFileSync(roomFilePath);
  const roomsDetail = JSON.parse(roomsData);

  return new Promise(resolve => resolve(roomsDetail));
};

const normalizeString = (str) => {
  return str.trim().toLowerCase()
    .split(' ').map(t => t.trim()).join('-')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}

const createRoomFileSync = () => {
  const roomsData = [];

  roomsData[0] = {
    id: uuid(), // normalizeString("Recepção"),
    name: "Recepção",
    disableMeeting: true,
  };

  const niceNames = [
    "Cozinha",
    "Sala de descanso",
    "Suporte TopCon",
    "Suporte TopGerente",
    "Desenvolvimento TopCon",
    "Desenvolvimento TopGerente",
    "Implantação TopCon",
    "Implantação TopGerente",
    "Implantação - Em Cliente",
    "BI",
    "Infra Interna",
    "Infra Externa",
    "Motor 2",
    "Recursos Humanos",
    "Diretoria",
    "Comercial",
    "Administrativo / Financeiro",
    "Marketing",
    "Produção de conteúdo",
    "Sala Reunião 01",
    "Sala Reunião 02",
    "Reunião Externa 01",
    "Reunião Externa 02",
    "Treinamentos"
  ];

  for (const niceName of niceNames) {
    roomsData.push({
      id: uuid(), //normalizeString(niceName),
      name: niceName
    });
  }

  fs.mkdirSync(path.dirname(roomFilePath), { recursive: true });
  fs.writeFileSync(roomFilePath, JSON.stringify(roomsData));
};

const fetchFromEnvironment = (env) => {
  const roomsData = env.ROOMS_DATA;
  const roomsDetail = JSON.parse(roomsData);

  return new Promise(resolve => resolve(roomsDetail));
};

const fetchRooms = (strategy) => {
  switch (strategy) {
    // TODO add suport to fetch from endpoint
    case "ENVIRONMENT":
      return fetchFromEnvironment(process.env);
    default:
      return fetchFromFile();
  }
};

export default fetchRooms;
