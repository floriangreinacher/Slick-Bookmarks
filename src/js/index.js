function BookmarkViewModel(title, path, url) {
  this.title = ko.observable(title);
  this.path = ko.observable(path);
  this.url = ko.observable(url);
  this.icon = ko.computed(function() {
    return "chrome://favicon/" + this.url();
  }, this);
}

BookmarkViewModel.prototype.open = function() {
  var self = this;
  chrome.tabs.create({
    url: self.url()
  });
};

function AppViewModel(root) {
  var self = this;

  self.pattern = ko.observable("");
  self.bookmarks = ko.computed(function() {
    var result = [];
    self.explore(result, root, self.pattern(), []);
    return result;
  });
}

AppViewModel.prototype.exploreFolder = function(result, folder, pattern, pathParts) {
  var self = this;

  pathParts.push(folder.title);
  for (var i = 0; i < folder.children.length; i++) {
    self.explore(result, folder.children[i], pattern, pathParts.slice(0));
  }
};

AppViewModel.prototype.exploreBookmark = function(result, bookmark, pattern, pathParts) {
  var self = this;

  if (bookmark.title.toLowerCase().indexOf(pattern.toLowerCase()) != -1) {
    result.push(
      new BookmarkViewModel(
        bookmark.title,
        pathParts.join("/"),
        bookmark.url));
  }
};

AppViewModel.prototype.explore = function(result, bookmarkOrFolder, pattern, pathParts) {
  var self = this;

  if (bookmarkOrFolder.children) {
    self.exploreFolder(result, bookmarkOrFolder, pattern, pathParts);
  } else {
    self.exploreBookmark(result, bookmarkOrFolder, pattern, pathParts);
  }
};

chrome.bookmarks.getSubTree("0", function(tree) {
  var appViewModel = new AppViewModel(tree[0]);
  ko.applyBindings(appViewModel);
});
