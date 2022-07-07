import { useState, useEffect, useLayoutEffect } from "react";
import HowToCook from "../public/components/HowToCook";
import Navbar from "../public/components/Navbar";
import RecipeViews from "../public/components/RecipeViews";
import SearchResults from "../public/Components/SearchResults";
import AddRecipe from "../public/components/AddRecipe";

export default function Home() {
  const [searchDetails, setSearchDetails] = useState("");
  const [fetchedRecipes, setFetchedRecipes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [recipeDetails, setRecipeDetails] = useState();
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeServings, setRecipeServings] = useState(undefined);
  const [modal, setModal] = useState(false);
  const [bookmark, setBookmark] = useState([]);
  const [loader, setLoader] = useState(true);
  const [newRecipeData, setNewRecipeData] = useState(undefined);

  //a function to format the individual recipe object gotten from the API into useful data
  const createRecipeData = (newRecipe) => {
    const recipe = {
      time: newRecipe.cooking_time,
      id: newRecipe.id,
      image: newRecipe.image_url,
      ingredients: newRecipe.ingredients,
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      servings: newRecipe.servings,
      source: newRecipe.source_url,
    };
    return recipe;
  };

  // a function to get lists of recipes from the search input
  const getRecipes = async () => {
    try {
      const response = await fetch(
        `https://forkify-api.herokuapp.com/api/v2/recipes?search=${searchDetails}`
      );
      const data = await response.json();
      const { recipes } = data.data;
      setFetchedRecipes(recipes);
    } catch (error) {
      console.log(error);
    }
  };

  //a function to get saved bookmark stored in the local storage on page load
  const getLocalStorage = () => {
    const storage = localStorage.getItem("bookmarks");
    if (storage) setBookmark(JSON.parse(storage));
  };

  useLayoutEffect(() => {
    getLocalStorage();
  }, []);

  const getRecipeDetails = async (id) => {
    setLoader(false);
    try {
      const response = await fetch(
        `https://forkify-api.herokuapp.com/api/v2/recipes/${id}`
      );
      const data = await response.json();
      let { recipe } = data.data;

      const newrecipe = createRecipeData(recipe);

      setRecipeDetails(newrecipe);
      setRecipeIngredients(newrecipe.ingredients);
      recipe && setLoader(true);
      setRecipeServings(newrecipe.servings);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    searchDetails && getRecipes();
  }, [searchDetails]);

  const displayBookmark = (id) => {
    const selectedBookmark = bookmark.filter((item) => item.id === id);
    console.log(selectedBookmark);
    setRecipeDetails(selectedBookmark[0]);
    setRecipeIngredients(selectedBookmark[0].ingredients);
    setRecipeServings(selectedBookmark[0].servings);
  };

  //A functionality to uploading new recipe and setting the newRecipe to the current recipe displayed
  const handleUpload = (newRecipe) => {
    setModal(!modal);
    setNewRecipeData(newRecipe);
    const uploadIngredients =
      newRecipeData &&
      Object.entries(newRecipeData)
        .filter((item) => item[0].startsWith("ingred") && item[1] !== "")
        .map((ing) => {
          const [quantity, unit, description] = ing[1]
            .replaceAll(" ", "")
            .split(",");
          return {
            quantity: quantity ? +quantity : null,
            unit: unit ? unit : "",
            description: description ? description : "",
          };
        });

    const uploadedRecipe = {
      cooking_time: +newRecipe.time,
      image_url: newRecipe.image_url,
      ingredients: uploadIngredients,
      title: newRecipe.Title,
      publisher: newRecipe.Publisher,
      servings: +newRecipe.Servings,
      source_url: newRecipe.Source_url,
    };
    console.log(uploadedRecipe);
    sendJson(uploadedRecipe);
  };

  //The functionality to send the data to the api
  const sendJson = async (recipe) => {
    try {
      const response = await fetch(
        `https://forkify-api.herokuapp.com/api/v2/recipes/?key=98838a28-e4ae-43ee-a738-7a8a896fe655`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/JSON",
          },
          body: JSON.stringify(recipe),
        }
      );
      const data = await response.json();
      if (data.status === "fail") throw new Error(`${data.message}`);
      //getting the uploaded recipe data from the return api call
      const apiUploadedRecipeDetails = data.data.recipe;

      //formatting the uploaded recipe data gottewn from thew api into useful data in our application using a custom function
      const uploadedRecipeDetail = createRecipeData(apiUploadedRecipeDetails);

      //setting the uploaded recipe to the current recipe to be displayed in the view
      setRecipeDetails(uploadedRecipeDetail);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative container min-h-[117rem] m-0  bg-bgContainer py-20 px-60">
      {modal && (
        <AddRecipe
          modal={modal}
          setModal={setModal}
          newRecipeData={newRecipeData}
          setNewRecipeData={setNewRecipeData}
          handleUpload={handleUpload}
        />
      )}

      <Navbar
        modal={modal}
        setModal={setModal}
        setSearchDetails={setSearchDetails}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        bookmark={bookmark}
        setBookmark={setBookmark}
        displayBookmark={displayBookmark}
      />

      <div className="main__section ">
        <SearchResults
          fetchedRecipes={fetchedRecipes}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          getRecipeDetails={getRecipeDetails}
        />

        <section className="main">
          <RecipeViews
            loader={loader}
            recipeDetails={recipeDetails}
            setRecipeDetails={setRecipeDetails}
            recipeIngredients={recipeIngredients}
            setRecipeIngredients={setRecipeIngredients}
            recipeServings={recipeServings}
            setRecipeServings={setRecipeServings}
            bookmark={bookmark}
            setBookmark={setBookmark}
          />
          <HowToCook recipeDetails={recipeDetails} />
        </section>
      </div>
    </div>
  );
}
