const { tavily } = require("@tavily/core");

const tvly = tavily({ 
    apiKey: process.env.TAVILY_API_KEY, 
});
// const response = await tvly.search("Who is Leo Messi?");

// console.log(response);

module.exports.searchInternet = async ({ query }) => {
    return await tvly.search(query,{
        maxResults: 5,
        searchDepth: "basic",
    });
}