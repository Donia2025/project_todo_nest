import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true })
export class Todo {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;
@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
createdBy: string;


@Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
assignedTo: Types.ObjectId | null;


  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null })
  completedBy: string;

  @Prop({ default: false })
  isCompleted: boolean;
  
}

export const TodoSchema = SchemaFactory.createForClass(Todo);
