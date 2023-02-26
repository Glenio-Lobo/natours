
export const getOverview = function(request, response){
    response.status(200).render('overview', {
        title: 'All Tours'
    })
}

export const getTour = function(request, response){
    response.status(200).render('tour', {
        title: 'Florest Hiker'
    })
}