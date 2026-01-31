import { Model, UpdateQuery } from "mongoose";


type Filter<T> = Partial<T> & Record<string, any>;

export abstract class BaseRepository<T>{
    protected model: Model<T>;

    constructor(model: Model<T>) {
        this.model = model;
    };

    async findById(id: string): Promise<T | null> {
        return this.model.findById(id);
    };

    async findOne(filter: Filter<T>): Promise<T | null> {
        return this.model.findOne(filter);
    };

    async findMany(
        filter: Filter<T> = {},
        skip = 0,
        limit = 10
    ): Promise<T[]> {
        return this.model.find(filter).skip(skip).limit(limit);
    }

    async count(filter: Filter<T> = {}): Promise<number> {
        return this.model.countDocuments(filter);
    };
    
    async create(data: Partial<T>): Promise<T> {
        return this.model.create(data);
    };

    async updateById(
        id: string,
        data: UpdateQuery<T>
    ): Promise<T | null> {
        return this.model.findByIdAndUpdate(id, data, { new: true });
    };

    async deleteById(id: string): Promise<T | null> {
        return this.model.findByIdAndDelete(id);
    };
};