class APIFeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){
        //1) Deletendo campos não autorizados nas queries de pesquisa.
        let reqQueryObj = {...this.queryString};
        const notAlowedFields = ['page', 'limit', 'sort', 'fields']; //Campos não autorizados
        notAlowedFields.forEach( key => delete reqQueryObj[key]);

        //2) Adicionando gt, gte, lt, lte. (Greater than e etc.). ?price[gt]=5
        let queryStr = JSON.stringify(reqQueryObj);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        //3)Salvando a query retornada pelo .find()
        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    sort(){
        //1) Implementando o parâmetro de ordenação. ?sort=field1,field2,field3,field4
        if(this.queryString.sort){
            const sortKeys = this.queryString.sort.replace(/,/g, ' ');
            this.query = this.query.sort(sortKeys);
        }else{
            //Por padrão os dados são ordenados decrescentemente pela data em que foram criados.
            this.query = this.query.sort('-createdAt -price -duration'); //'-price duration'
        }

        return this;
    }

    limitFields(){
        // Limitando os fields da resposta. ?fields=field1,field2,field3
        if(this.queryString.fields){
            const fieldsValues = this.queryString.fields.replace(/,/g, ' ');
            this.query.select(fieldsValues);
        }else{
            this.query.select('-__v'); //Default Select
        }

        return this;
    }

    paginate(){
        //6) Paginação ?page=2&limit=10
        const page = this.queryString.page || 1;
        const limit = this.queryString.limit || 100;
        const skip = (page-1)*limit;

        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

export { APIFeatures };