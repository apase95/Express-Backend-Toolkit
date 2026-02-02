import { Model, UpdateQuery } from "mongoose";


export type Filter<T> = Partial<T> & Record<string, any>;

export abstract class BaseRepository<T>{
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    };
    
    async create(data: Partial<T>): Promise<T> {
        return this.model.create(data);
    };

    async count(filter: Filter<T> = {}): Promise<number> {
        return this.model.countDocuments(filter).exec();
    };

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id).exec();
    };

    async findOne(filter: Filter<T>): Promise<T | null> {
        return this.model.findOne(filter).exec();
    };

    async findMany(
        filter: Filter<T> = {},
        skip = 0,
        limit = 10,
        sort: Record<string, any> = { createdAt: -1 },
    ): Promise<T[]> {
        return this.model.find(filter).sort(sort).skip(skip).limit(limit).exec();
    };

    async updateById(
        id: string,
        data: UpdateQuery<T>
    ): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
    };

    async updateOne(
        filter: Filter<T>, 
        data: UpdateQuery<T>
    ): Promise<T | null> {
        return this.model.findOneAndUpdate(filter, data, { new: true }).exec();
    };

    async deleteById(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id).exec();
    };
};