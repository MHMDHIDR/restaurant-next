import { Model } from 'mongoose'

const paginatedResults = async (model: Model<any>, req: any, res: any) => {
  const page = parseInt(req.query.page)
  const limit = parseInt(req.query.limit)
  const { itemId, category, orderDate, createdAt, updatedAt } = req.query

  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const response: any = {}

  if (endIndex < (await model.countDocuments())) {
    response.next = {
      page: page + 1,
      limit: limit
    }
  }

  if (startIndex > 0) {
    response.previous = {
      page: page - 1,
      limit: limit
    }
  }

  try {
    response.response = itemId
      ? await model.findById(itemId)
      : category
      ? await model
          .find({ category })
          .limit(limit)
          .skip(startIndex)
          .sort(orderDate ? { orderDate } : updatedAt ? { updatedAt } : { createdAt })
      : await model
          .find()
          .limit(limit)
          .skip(startIndex)
          .sort(orderDate ? { orderDate } : updatedAt ? { updatedAt } : { createdAt })

    response.itemsCount = category
      ? await model.countDocuments({ category })
      : await model.estimatedDocumentCount()

    response.numberOfPages = Math.ceil(response.itemsCount / limit)

    response.category = category

    res.paginatedResults = response

    return response
  } catch (e: any) {
    res.status(500).json({ message: e.message })
  }
}

export default paginatedResults
