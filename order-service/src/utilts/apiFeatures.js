export class ApiFeatures {
    constructor(mongooseQuery, query) {
        this.mongooseQuery = mongooseQuery;
        this.query = query;
        this.queryString = {}; // Store the processed query for count operations
    }

    paginate() {
        const page = Math.max(1, parseInt(this.query.page) || 1);
        const limit = Math.max(1, Math.min(100, parseInt(this.query.limit) || 10));
        const skip = (page - 1) * limit;
        
        this.page = page;
        this.limit = limit;
        this.mongooseQuery.skip(skip).limit(limit);
        return this;
    }

    filter() {
        const queryObj = { ...this.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'keyword', 'q'];
        excludedFields.forEach(field => delete queryObj[field]);

        // Handle advanced filtering (gt, gte, lt, lte)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        
        const parsedQuery = JSON.parse(queryStr);
        this.queryString = parsedQuery; // Store for count operations
        this.mongooseQuery.find(parsedQuery);
        
        return this;
    }

    sort() {
        if (this.query.sort) {
            const sortBy = this.query.sort.split(',').join(' ');
            this.mongooseQuery.sort(sortBy);
        } else {
            // Default sort by createdAt in descending order
            this.mongooseQuery.sort('-createdAt');
        }
        return this;
    }

    search() {
        const searchQuery = this.query.keyword || this.query.q;
        if (searchQuery) {
            const searchRegex = { $regex: searchQuery, $options: 'i' };
            this.mongooseQuery.find({
                $or: [
                    // Search in product fields
                    { 'productId.name.en': searchRegex },
                    { 'productId.name.ar': searchRegex },
                    { 'productId.description': searchRegex },
                    // Search in agent product fields
                    { status: searchRegex }
                ]
            });
        }
        return this;
    }

    fields() {
        if (this.query.fields) {
            const fields = this.query.fields.split(',').join(' ');
            this.mongooseQuery.select(fields);
        } else {
            // Exclude internal fields by default
            this.mongooseQuery.select('-__v');
        }
        return this;
    }
}