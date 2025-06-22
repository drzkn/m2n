import { Block } from '../entities/Block';
import { INotionRepository } from '../../ports/output/repositories/INotionRepository';

export class GetBlockChildrenUseCase {
  constructor(private notionRepository: INotionRepository) { }

  async execute(blockId: string): Promise<Block[]> {
    if (!blockId) {
      throw new Error('Block ID es requerido');
    }

    return this.notionRepository.getBlockChildren(blockId);
  }
} 