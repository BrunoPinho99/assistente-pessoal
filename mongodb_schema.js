/**
 * Script de inicialização e validação de Schema nativo do MongoDB (mongosh / MongoDB Atlas)
 * Coleção: projects
 * Validação: $jsonSchema
 *
 * Execução no mongosh:
 *   load("mongodb_schema.js")
 */

db = db.getSiblingDB('personal_os');

// Criação ou atualização da coleção com validação estrita
db.createCollection("projects", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "category", "isLocked", "unlockConditions"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        name: {
          bsonType: "string",
          description: "Nome do projeto ou da ideia - campo obrigatório."
        },
        category: {
          enum: ["business", "academic", "parking"],
          description: "business (Littera, Aura), academic (Faculdade IDP) ou parking (Ideias novas)."
        },
        isLocked: {
          bsonType: "bool",
          description: "O cadeado. Padrão ao criar ideias novas (parking): true."
        },
        unlockConditions: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Array de strings com as condições necessárias para liberar o projeto do Estacionamento."
        },
        description: {
          bsonType: "string",
          description: "Escopo ou descrição resumida do projeto."
        },
        mainGoal: {
          bsonType: "string",
          description: "Meta central de entrega do projeto."
        },
        nextStep: {
          bsonType: "string",
          description: "Próximo passo imediato para avançar na entrega."
        },
        area: {
          bsonType: "string",
          description: "Área de contexto (Littera, Aura, IDP, Estacionamento)."
        },
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "error"
});

// Índices essenciais para consultas de alta performance
db.projects.createIndex({ isLocked: 1, category: 1 });
db.projects.createIndex({ createdAt: -1 });

// Seeds iniciais com as regras do TDAH Focus OS
db.projects.insertMany([
  {
    name: "Littera Platform",
    category: "business",
    isLocked: false,
    unlockConditions: [],
    area: "Littera",
    description: "Infraestrutura SaaS, engine de publicação e deploy de microsserviços.",
    mainGoal: "Finalizar deploy estável da v2.4 com isolamento de tenant.",
    nextStep: "Executar pipeline de deploy e monitorar logs de latência.",
    createdAt: new Date("2026-10-01T10:00:00Z"),
    updatedAt: new Date("2026-11-07T14:00:00Z")
  },
  {
    name: "Aura Studio & Design System",
    category: "business",
    isLocked: false,
    unlockConditions: [],
    area: "Aura",
    description: "Identidade visual, biblioteca de componentes espaciais e prototipagem interativa.",
    mainGoal: "Entregar o kit de componentes v1.0 no Figma e tokens em Tailwind.",
    nextStep: "Ajustar o contraste tipográfico dos cards no Dark Mode.",
    createdAt: new Date("2026-10-15T14:00:00Z"),
    updatedAt: new Date("2026-11-06T18:00:00Z")
  },
  {
    name: "IDP — Governança e Regulação de IA",
    category: "academic",
    isLocked: true,
    unlockConditions: [
      "Publicar v1.8 do Littera em produção",
      "Liberar 1 dos 2 slots de foco ativo (Regra da Substituição)"
    ],
    area: "IDP",
    description: "Pesquisa acadêmica, seminários de pós-graduação e publicação científica.",
    mainGoal: "Submissão do paper final e apresentação no simpósio.",
    nextStep: "Finalizar conclusão do ensaio e formatar referências ABNT.",
    createdAt: new Date("2026-09-01T08:00:00Z"),
    updatedAt: new Date("2026-11-07T10:00:00Z")
  }
]);

print("✅ Coleção 'projects' criada no MongoDB com validação $jsonSchema e seeds iniciais inseridos com sucesso!");
