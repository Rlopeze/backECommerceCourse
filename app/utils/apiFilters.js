class APIFilters {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }

    search() {
      const keyword = this.queryString.keyword ? {
        name: {
          $regex: this.queryString.keyword,
          $options: 'i'
        }
      } : {}

      this.query = this.query.find({ ...keyword });
      return this;
    }
    filters() {
      const queryCopy = { ...this.queryString };

      const removeFields = ['keyword', 'page'];
      removeFields.forEach(el => delete queryCopy[el]);

      // gt = greater than
      // gte = greater than or equal
      // lt = less than
      // lte = less than or equal
      let queryStr = JSON.stringify(queryCopy);
      queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

      this.query = this.query.find(JSON.parse(queryStr));
      return this;
    }

    pagination(resPerPage) {
      const currentPage = Number(this.queryString.page) || 1;
      const skip = resPerPage * (currentPage - 1);

      this.query = this.query.skip(skip).limit(resPerPage);

      return this;
    }
}

export default APIFilters;