export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PagingData<T> {
    data: T[];
    meta: {
        totalItems: number;
        total: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}


export const getPaginationParams = (
    query: any, 
    defaultLimit = 10
): PaginationParams => {
    
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, parseInt(query.limit) || defaultLimit);
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
};


export const getPagingData = <T>(
    data: T[],
    totalItems: number,
    page: number,
    limit: number
): PagingData<T> => {

    const totalPages = Math.ceil(totalItems / limit);

    return {
        data,
        meta: {
            totalItems,
            total: totalItems,
            itemsPerPage: limit,
            totalPages,
            currentPage: page,
        },
    };
};