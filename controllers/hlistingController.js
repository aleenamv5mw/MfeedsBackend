/* const Hlisting = require("../models/hlisting");

module.exports = {
  fetch: async (request, reply) => {
    try {
      const { keyword } = request.query;
      const regex = new RegExp(keyword, "i"); // 'i' for case-insensitive search
      const hlistings = await Hlisting.find({
        $or: [
          { vendor: regex },
          { title: regex },
          { url: regex },
          { datadescription: regex },
          { address: regex },
          { type: regex },
          { area: regex },
          { price: regex },
          { correction: regex },

          { year: isNaN(Number(keyword)) ? undefined : Number(keyword) },
        ].filter(Boolean),
      });
      reply.code(200).send(hlistings);
    } catch (e) {
      reply.code(500).send(e);
    }
  },
};
 */
