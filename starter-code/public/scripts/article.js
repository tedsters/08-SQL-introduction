'use strict';

function Article (opts) {
  // REVIEW: Convert property assignment to a new pattern. Now, ALL properties of `opts` will be
  // assigned as properies of the newly created article object. We'll talk more about forEach() soon!
  // We need to do this so that our Article objects, created from DB records, will have all of the DB columns as properties (i.e. article_id, author_id...)
  Object.keys(opts).forEach(function(e) {
    this[e] = opts[e]
  }, this);
}

Article.all = [];

// ++++++++++++++++++++++++++++++++++++++

// REVIEW: We will be writing documentation today for the methods in this file that handles Model layer of our application. As an example, here is documentation for Article.prototype.toHtml(). You will provide documentation for the other methods in this file in the same structure as the following example. In addition, where there are TODO comment lines inside of the method, describe what the following code is doing (down to the next TODO) and change the TODO into a DONE when finished.

/**
 * OVERVIEW of Article.prototype.toHtml():
 * - A method on each instance that converts raw article data into HTML
 * - Inputs: nothing passed in; called on an instance of Article (this)
 * - Outputs: HTML of a rendered article template
 */
Article.prototype.toHtml = function() {
  // DONE: Retrieves the  article template from the DOM and passes the template as an argument to the Handlebars compile() method, with the resulting function being stored into a variable called 'template'.
  var template = Handlebars.compile($('#article-template').text());

  // DONE: Creates a property called 'daysAgo' on an Article instance and assigns to it the number value of the days between today and the date of article publication
  this.daysAgo = parseInt((new Date() - new Date(this.publishedOn))/60/60/24/1000);

  // DONE: Creates a property called 'publishStatus' that will hold one of two possible values: if the article has been published (as indicated by the check box in the form in new.html), it will be the number of days since publication as calculated in the prior line; if the article has not been published and is still a draft, it will set the value of 'publishStatus' to the string '(draft)'
  this.publishStatus = this.publishedOn ? `published ${this.daysAgo} days ago` : '(draft)';

  // DONE: Assigns into this.body the output of calling marked() on this.body, which converts any Markdown formatted text into HTML, and allows existing HTML to pass through unchanged
  this.body = marked(this.body);

// DONE: Output of this method: the instance of Article is passed through the template() function to convert the raw data, whether from a data file or from the input form, into the article template HTML
  return template(this);
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of Article.loadAll();.
 * - The method is being .
 * - Inputs: a and b are the inputs and they are being used in the publishedOn or the dates that are stored in that instance of publishedOn.
 * - Outputs: On line 53, the dates are then being subtracted from eachother which in turn will give you how many days will be inbetween those dates and push them out to be published.
 */
Article.loadAll = function(rows) {
  // DONE: This code is subracting the two dates to give you the certain amount of time inbetween those two dates to actually give you how many days there are. Those two dates are then returned so you can input them into the publishedOn key value to be published onto the page in the future.
  rows.sort(function(a,b) {
    return (new Date(b.publishedOn)) - (new Date(a.publishedOn));
  });

  // DONE: This piece of code it is running through a loop and inputting that information into the different key value pairs in the constructor function to get ready to publicate onto the page.
  rows.forEach(function(ele) {
    Article.all.push(new Article(ele));
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of fetchAll methode
 * - This methode is going to fetch information in the constructor function to get ready to put into the page.
 * - Inputs: Article is the input and it is going to be what give the information to the function so that it can have stuff to load.
 * - Outputs: The output is going to be the callback that is in the function called callback. It is going to be what stores all the information that is being fetched by this function.
 */
Article.fetchAll = function(callback) {
  // DONE: This code is using AJAX and JSON to get information from this article.js file to use in the future.
  $.get('/articles')
  // DONE: .then adds handlers that does stuff when an defferd object is resolved, rejected, or still in progress which means when it it gets a response from a database it will do something with that information.
  .then(
    function(results) {
      if (results.length) { // If records exist in the DB
        // DONE: lodall is being called with the callback of results that has information that it needs to check. the callback is being called becuase it has not been called yet so it is not going to do anything until it runs this information.
        Article.loadAll(results);
        callback();
      } else { // if NO records exist in the DB
        // DONE: This piece of code is using AJAX/JSON to then pull or store records into said DB so that when this function is run again it can then just use the information to create what it needs to.
        $.getJSON('./data/hackerIpsum.json')
        .then(function(rawData) {
          rawData.forEach(function(item) {
            let article = new Article(item);
            article.insertRecord(); // Add each record to the DB
          })
        })
        // DONE: This method is being called with the callback of callback.
        .then(function() {
          Article.fetchAll(callback);
        })
        // DONE: This is checking to see if SQL comes back with an error message and if it does it will set a console log to tell you what it is.
        .catch(function(err) {
          console.error(err);
        });
      }
    }
  )
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - truncateTable deletes the table to make sure another table can render when deleted.
 * - Inputs: Article is the inputs
 * - Outputs: the output is the callback.
 */
Article.truncateTable = function(callback) {
  // DONE: making an ajax call so that when it is called it can delete the tables.
  $.ajax({
    url: '/articles',
    method: 'DELETE',
  })
  // DONE: Running the then statement and if it gets no data or sees that there is no data in callback then it calls itself so it can input that information.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - This prototype is inserting new data into the table.
 * - Inputs: Article
 * - Outputs: insertRecord
 */
Article.prototype.insertRecord = function(callback) {
  // DONE: It is creating new data to put into the articles table.
  $.post('/articles', {author: this.author, authorUrl: this.authorUrl, body: this.body, category: this.category, publishedOn: this.publishedOn, title: this.title})
  // DONE: Running a then to check to see if data is done and checking it with an if statement so that it can run and call itself.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  })
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of
 * - You are deleting information from your table.
 * - Inputs: Articles.
 * - Outputs: deleteRecord
 */
Article.prototype.deleteRecord = function(callback) {
  // DONE: calling an ajax call to make sure when it is called it deletes everything in the article_id.
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'DELETE'
  })
  // DONE: running a then statement to see if call back has been called yet and if it hasnt then it will call it.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};

// ++++++++++++++++++++++++++++++++++++++

// DONE
/**
 * OVERVIEW of updateRecord();
 * - This methode updates the information that is inside of the table.
 * - Inputs: articles
 * - Outputs: updateRecord because it has what it is going to be doing when it is called.
 */
Article.prototype.updateRecord = function(callback) {
  // DONE: AJAX call to input data into the table when called.
  $.ajax({
    url: `/articles/${this.article_id}`,
    method: 'PUT',
    data: {  // DONE: These are the data types that are going to be put into the table.
      author: this.author,
      authorUrl: this.authorUrl,
      body: this.body,
      category: this.category,
      publishedOn: this.publishedOn,
      title: this.title
    }
  })
  // DONE: If it already has the information then just call itself to render the table.
  .then(function(data) {
    console.log(data);
    if (callback) callback();
  });
};
