import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Categorias estritas do TDAH Focus OS:
 * - 'business': Empresas e frentes de receita ativa (Littera, Aura).
 * - 'academic': Pós-graduação, pesquisa ou faculdade (IDP).
 * - 'parking': Novas ideias impulsivas retidas no Estacionamento de Dopamina.
 */
export type ProjectCategory = 'business' | 'academic' | 'parking';

export interface IProjectStage {
  id?: string;
  title: string;
  completed: boolean;
}

export interface IProject {
  name: string;
  category: ProjectCategory;
  isLocked: boolean;
  unlockConditions: string[];
  description?: string;
  mainGoal?: string;
  nextStep?: string;
  stages?: IProjectStage[];
  area?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProjectDocument extends IProject, Document {
  lock(conditions?: string[]): Promise<IProjectDocument>;
  unlock(): Promise<IProjectDocument>;
}

export interface IProjectModel extends Model<IProjectDocument> {
  findActiveProjects(): Promise<IProjectDocument[]>;
  findParkedProjects(): Promise<IProjectDocument[]>;
  parkNewIdea(name: string, unlockConditions?: string[]): Promise<IProjectDocument>;
}

const ProjectStageSchema = new Schema<IProjectStage>(
  {
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false }
  },
  { _id: true }
);

/**
 * MongoDB / Mongoose Schema para Projects (TDAH Focus OS)
 */
export const ProjectSchema = new Schema<IProjectDocument, IProjectModel>(
  {
    name: {
      type: String,
      required: [true, 'O nome do projeto é obrigatório'],
      trim: true,
      minlength: [2, 'O nome deve ter pelo menos 2 caracteres'],
      maxlength: [120, 'O nome deve ter no máximo 120 caracteres']
    },
    category: {
      type: String,
      required: [true, 'A categoria do projeto é obrigatória'],
      enum: {
        values: ['business', 'academic', 'parking'],
        message: '{VALUE} não é uma categoria válida. Use: business, academic ou parking.'
      },
      default: 'parking',
      index: true
    },
    isLocked: {
      type: Boolean,
      required: true,
      default: function (this: IProjectDocument) {
        // Regra TDAH: Se for ideia nova (parking), o padrão OBRIGATÓRIO é locked = true
        return this.category === 'parking' ? true : false;
      },
      index: true
    },
    unlockConditions: {
      type: [String],
      default: function (this: IProjectDocument) {
        // Se trancado, exige critérios objetivos de desbloqueio para evitar guilt de arquivamento
        if (this.isLocked || this.category === 'parking') {
          return [
            'Concluir entrega prioritária do Littera em produção',
            'Liberar 1 dos 3 slots de banda (Regra da Substituição)'
          ];
        }
        return [];
      }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    mainGoal: {
      type: String,
      trim: true,
      default: ''
    },
    nextStep: {
      type: String,
      trim: true,
      default: ''
    },
    stages: {
      type: [ProjectStageSchema],
      default: []
    },
    area: {
      type: String,
      trim: true,
      default: function (this: IProjectDocument) {
        if (this.category === 'business') return 'Littera';
        if (this.category === 'academic') return 'IDP';
        return 'Estacionamento';
      }
    }
  },
  {
    timestamps: true,
    collection: 'projects'
  }
);

// Índices para otimização de busca de projetos ativos e trancados
ProjectSchema.index({ isLocked: 1, category: 1 });
ProjectSchema.index({ createdAt: -1 });

// Middleware Pre-Validate: Garante que ideias novas 'parking' sempre nasçam com cadeado
ProjectSchema.pre('validate', function () {
  if (this.category === 'parking') {
    this.isLocked = true;
    if (!this.unlockConditions || this.unlockConditions.length === 0) {
      this.unlockConditions = [
        'Concluir entrega prioritária do Littera em produção',
        'Liberar 1 dos 3 slots de banda (Regra da Substituição)'
      ];
    }
  }
});

// Middleware Pre-Save: Validação da Regra do Protocolo 1-1-1 (Máximo 3 Slots Ativos)
ProjectSchema.pre('save', async function () {
  if (this.isModified('isLocked') && this.isLocked === false) {
    const ProjectModel = this.constructor as IProjectModel;
    const activeCount = await ProjectModel.countDocuments({
      _id: { $ne: this._id },
      isLocked: false
    });

    if (activeCount >= 3) {
      throw new Error(
        'Regra da Substituição violada: limite máximo de 3 slots simultâneos do Protocolo 1-1-1 atingido. Tranque um projeto antes de ativar outro.'
      );
    }
  }
});

// Métodos de Instância
ProjectSchema.methods.lock = async function (conditions?: string[]): Promise<IProjectDocument> {
  this.isLocked = true;
  if (conditions && conditions.length > 0) {
    this.unlockConditions = conditions;
  }
  return this.save();
};

ProjectSchema.methods.unlock = async function (): Promise<IProjectDocument> {
  this.isLocked = false;
  return this.save();
};

// Métodos Estáticos (Helpers para o Agente de IA e Services)
ProjectSchema.statics.findActiveProjects = function (): Promise<IProjectDocument[]> {
  return this.find({ isLocked: false }).sort({ updatedAt: -1 }).limit(2).exec();
};

ProjectSchema.statics.findParkedProjects = function (): Promise<IProjectDocument[]> {
  return this.find({ isLocked: true }).sort({ createdAt: -1 }).exec();
};

ProjectSchema.statics.parkNewIdea = function (
  name: string,
  unlockConditions?: string[]
): Promise<IProjectDocument> {
  return this.create({
    name,
    category: 'parking',
    isLocked: true,
    unlockConditions: unlockConditions || [
      'Concluir entrega prioritária do Littera em produção',
      'Liberar 1 dos 3 slots de banda (Regra da Substituição)'
    ]
  });
};

export const ProjectModel: IProjectModel =
  (mongoose.models.Project as IProjectModel) ||
  mongoose.model<IProjectDocument, IProjectModel>('Project', ProjectSchema);

export default ProjectModel;
