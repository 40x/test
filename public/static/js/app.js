(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("application", function(exports, require, module) {
var Application, Employees, HighScores, Login, Router,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Login = require('lib/login');

Router = require('lib/router');

Employees = require('collections/employees');

HighScores = require('collections/highScores');

Application = (function() {
  function Application() {
    this.fetchResources = bind(this.fetchResources, this);
    this.initialize = bind(this.initialize, this);
  }

  Application.prototype.initialize = function() {
    this.login = new Login(env);
    this.views = {};
    this.collections = {};
    this.setupStyles();
    return this.login.verifyUser((function(_this) {
      return function(data) {
        return _this.fetchResources(function() {
          $('#loader').hide();
          _this.router = new Router;
          Backbone.history.start({
            pushState: true,
            root: '/facewall'
          });
          return typeof Object.freeze === "function" ? Object.freeze(_this) : void 0;
        });
      };
    })(this));
  };

  Application.prototype.fetchResources = function(success) {
    var resolve, resources;
    this.resolve_countdown = 0;
    resolve = (function(_this) {
      return function() {
        _this.resolve_countdown -= 1;
        if (_this.resolve_countdown === 0) {
          return success();
        }
      };
    })(this);
    resources = [
      {
        collection_key: 'employees',
        collection: Employees,
        error_phrase: 'employees'
      }, {
        collection_key: 'highScores',
        collection: HighScores,
        pre_fetch: false
      }
    ];
    return _.each(resources, (function(_this) {
      return function(r) {
        _this.resolve_countdown += 1;
        _this.collections[r.collection_key] = new r.collection;
        if (r.pre_fetch === false) {
          return resolve();
        }
        return _this.collections[r.collection_key].fetch({
          error: function() {
            return utils.simpleError("An error occurred while trying to load " + constants.company_name + " " + r.error_phrase + ".");
          },
          success: function() {
            return resolve();
          }
        });
      };
    })(this));
  };

  Application.prototype.setupStyles = function() {
    return $('body').css({
      background: constants.styles.background,
      color: "rgb(" + constants.styles.color_rgb + ")"
    });
  };

  return Application;

})();

module.exports = new Application;
});

;require.register("collections/collection", function(exports, require, module) {
var Collection,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = Collection = (function(superClass) {
  extend(Collection, superClass);

  function Collection() {
    return Collection.__super__.constructor.apply(this, arguments);
  }

  return Collection;

})(Backbone.Collection);
});

;require.register("collections/employees", function(exports, require, module) {
var Collection, Employees, USER_JSON, defaultGravatarImage,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Collection = require('./collection');

defaultGravatarImage = location.search !== '?shame' ? '404' : 'blank';

USER_JSON = "{\"users\":[{\"firstName\":\"Kashyap\",\"lastName\":\"Mukkamala\",\"email\":\"kmukkamala@egen.solutions\"},{\"firstName\":\"Divyanshu\",\"lastName\":\"Mittal\",\"email\":\"mittal.divyanshu046@gmail.com\"},{\"firstName\":\"Kesava\",\"lastName\":\"Sreeram\",\"email\":\"movetojunk2@gmail.com\"},{\"firstName\":\"Nitika\",\"lastName\":\"Khanna\",\"email\":\"nkhanna@egen.solutions\"},{\"firstName\":\"Nitin\",\"lastName\":\"Ankam\",\"email\":\"nankam@egen.solutions\"},{\"firstName\":\"Sai Teja\",\"lastName\":\"Lingam\",\"email\":\"saitejalingam@gmail.com\"},{\"firstName\":\"Sanket\",\"lastName\":\"Patel\",\"email\":\"sanketpatel.301090@gmail.com\"},{\"firstName\":\"Sandeep\",\"lastName\":\"Jamithireddy\",\"email\":\"sreddy@egen.solutions\"},{\"firstName\":\"Siddharth\",\"lastName\":\"Soman\",\"email\":\"ssoman@egen.solutions\"},{\"firstName\":\"Anurag\",\"lastName\":\"Sharma\",\"email\":\"ansharma@egen.solutions\"},{\"firstName\":\"Suki\",\"lastName\":\"Baldwin\",\"email\":\"accounts@egeni.com\"},{\"firstName\":\"Rajani\",\"lastName\":\"Gurram\",\"email\":\"rgurram@egen.solutions\"},{\"firstName\":\"Anusha\",\"lastName\":\"Dwivedula\",\"email\":\"anusha.dwivedula@gmail.com\"},{\"firstName\":\"Jake\",\"lastName\":\"Smith\",\"email\":\"Jakedx6@gmail.com\"},{\"firstName\":\"Kashyap\",\"lastName\":\"Mukkamala\",\"email\":\"kmukkamala@egen.solutions\"},{\"firstName\":\"Divyanshu\",\"lastName\":\"Mittal\",\"email\":\"mittal.divyanshu046@gmail.com\"},{\"firstName\":\"Kesava\",\"lastName\":\"Sreeram\",\"email\":\"movetojunk2@gmail.com\"},{\"firstName\":\"Nitika\",\"lastName\":\"Khanna\",\"email\":\"nkhanna@egen.solutions\"},{\"firstName\":\"Sandeep\",\"lastName\":\"Hosangadi\",\"email\":\"shosangadi@egen.solutions\"}]}";

Employees = (function(superClass) {
  extend(Employees, superClass);

  function Employees() {
    return Employees.__super__.constructor.apply(this, arguments);
  }

  Employees.prototype.fetch = function(options) {
    this.add(this.parse(JSON.parse(USER_JSON)));
    return setTimeout((function() {
      return options.success();
    }), 100);
  };

  Employees.prototype.parse = function(data) {
    return _.map(data.users, (function(_this) {
      return function(employee) {
        employee.gravatar = "https://secure.gravatar.com/avatar/" + (CryptoJS.MD5(employee.email.toLowerCase())) + "?d=" + defaultGravatarImage;
        if (!employee.role) {
          employee.role = employee.firstName + ' ' + employee.lastName;
        }
        return employee;
      };
    })(this));
  };

  return Employees;

})(Collection);

module.exports = Employees;
});

;require.register("collections/highScores", function(exports, require, module) {
var Collection, HighScores,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

Collection = require('./collection');

HighScores = (function(superClass) {
  extend(HighScores, superClass);

  function HighScores() {
    this.comparator = bind(this.comparator, this);
    return HighScores.__super__.constructor.apply(this, arguments);
  }

  HighScores.prototype.url = function() {
    return "https://" + env.INTERNAL_BASE + "/gamera/v1/list/facewall-game/high-scores?access_token=" + app.login.context.auth.access_token.token;
  };

  HighScores.prototype.parse = function(data) {
    return _.map(data.item, (function(_this) {
      return function(score) {
        score.gravatar = "https://secure.gravatar.com/avatar/" + (CryptoJS.MD5(score.email.toLowerCase())) + "?d=404&s=160";
        _.extend(score, utils.parseQueryString(score.value));
        if (score.name) {
          score.name = score.name.replace('\+', ' ');
        }
        score.email = decodeURIComponent(score.email);
        score.score = decodeURIComponent(score.score);
        score = _this.parseScore(score);
        return score;
      };
    })(this));
  };

  HighScores.prototype.parseScore = function(score) {
    var guessedCorrectly, guessedIncorrectly, ref;
    ref = score.score.split('\/'), guessedCorrectly = ref[0], guessedIncorrectly = ref[1];
    score.guessedCorrectly = parseInt(guessedCorrectly, 10);
    score.guessedIncorrectly = (parseInt(guessedIncorrectly, 10)) - score.guessedCorrectly;
    score.sortScore = score.guessedCorrectly - score.guessedIncorrectly;
    return score;
  };

  HighScores.prototype.comparator = function(a, b) {
    return b.get('sortScore') - a.get('sortScore');
  };

  return HighScores;

})(Collection);

module.exports = HighScores;
});

;require.register("constants", function(exports, require, module) {
var constants;

constants = {
  company_name: 'Egen Solutions',
  hosted_domain: 'egen.solutions',
  app_name: 'facewall',
  api_base: 'kumonga/v2',
  autoplay: true,
  autoplay_seconds: 4,
  refresh_seconds: 30 * 60,
  useAutoSizing: true,
  columnWidth: 150,
  threedee: false,
  styles: {
    background: '#FF860D',
    color_rgb: '255, 134, 13'
  }
};

module.exports = constants;
});

;require.register("env", function(exports, require, module) {
module.exports = {
  env: 'local',
  API_BASE: 'api.hubapiqa.com',
  APP_BASE: 'app.hubspotqa.com',
  LOGIN_BASE: 'login.hubspotqa.com',
  NAV_BASE: 'navqa.hubapi.com',
  STATIC_BASE: 'static.hubspotqa.com',
  INTERNAL_BASE: 'internal.hubapiqa.com',
  LOGIN_PORTAL: 99121841
};
});

;require.register("initialize", function(exports, require, module) {
window.env = require('env');

window.utils = require('utils');

window.constants = require('constants');

window.app = require('application');

_.mixin(_.string.exports());

$(function() {
  return app.initialize();
});
});

;require.register("lib/login", function(exports, require, module) {
var Login,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Login = (function() {
  function Login() {
    this.verifyUser = bind(this.verifyUser, this);
  }

  Login.prototype.verifyUser = function(callback) {
    return callback();
  };

  return Login;

})();

module.exports = Login;
});

;require.register("lib/router", function(exports, require, module) {
var FaceWallGameView, FaceWallView, NavigationView, PageNotFoundView, Router, navHandler,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

FaceWallView = require('views/facewall');

FaceWallGameView = require('views/facewallGame');

PageNotFoundView = require('views/page_not_found');

NavigationView = require('views/navigation');

navHandler = function() {
  if (app.views.navigationView == null) {
    app.views.navigationView = new NavigationView;
  }
  return app.views.navigationView.render();
};

Router = (function(superClass) {
  extend(Router, superClass);

  function Router() {
    return Router.__super__.constructor.apply(this, arguments);
  }

  Router.prototype.routes = {
    '': 'facewallHandler',
    '/': 'facewallHandler',
    'game': 'facewallGameHandler',
    'game/': 'facewallGameHandler',
    '*anything': 'show404Page'
  };

  Router.prototype.basicPageHandler = function() {
    navHandler();
    app.views.current_view = void 0;
    return $('#page').html(require("../views/templates/" + Backbone.history.fragment));
  };

  Router.prototype.facewallHandler = function() {
    navHandler();
    if (app.views.facewallView == null) {
      app.views.facewallView = new FaceWallView;
    }
    app.views.current_view = app.views.facewallView;
    return app.views.facewallView.render();
  };

  Router.prototype.facewallGameHandler = function() {
    navHandler();
    if (app.views.facewallGameView == null) {
      app.views.facewallGameView = new FaceWallGameView;
    }
    app.views.current_view = app.views.facewallGameView;
    return app.views.facewallGameView.render();
  };

  Router.prototype.show404Page = function() {
    navHandler();
    if (app.views.pageNotFoundView == null) {
      app.views.pageNotFoundView = new PageNotFoundView;
    }
    app.views.current_view = app.views.pageNotFoundView;
    return app.views.pageNotFoundView.render();
  };

  return Router;

})(Backbone.Router);

module.exports = Router;
});

;require.register("lib/view_helper", function(exports, require, module) {
Handlebars.registerHelper('ifLT', function(v1, v2, options) {
  if (v1 < v2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('ifGT', function(v1, v2, options) {
  if (v1 > v2) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

Handlebars.registerHelper('pluralize', function(number, single, plural) {
  if (number === 1) {
    return single;
  } else {
    return plural;
  }
});

Handlebars.registerHelper('eachWithFn', function(items, options) {
  return _(items).map((function(_this) {
    return function(item, i, items) {
      item._counter = i;
      item._1counter = i + 1;
      item._first = i === 0 ? true : false;
      item._last = i === (items.length - 1) ? true : false;
      item._even = (i + 1) % 2 === 0 ? true : false;
      item._thirded = (i + 1) % 3 === 0 ? true : false;
      item._sixthed = (i + 1) % 6 === 0 ? true : false;
      _.isFunction(options.hash.fn) && options.hash.fn.apply(options, [item, i, items]);
      return options.fn(item);
    };
  })(this)).join('');
});
});

;require.register("models/model", function(exports, require, module) {
var Model,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

module.exports = Model = (function(superClass) {
  extend(Model, superClass);

  function Model() {
    return Model.__super__.constructor.apply(this, arguments);
  }

  return Model;

})(Backbone.Model);
});

;require.register("utils", function(exports, require, module) {
var Utils,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

Utils = (function() {
  function Utils() {
    this.parseQueryString = bind(this.parseQueryString, this);
  }

  Utils.prototype.getHTMLTitleFromHistoryFragment = function(fragment) {
    return _.capitalize(fragment.split('\/').join(' '));
  };

  Utils.prototype.simpleError = function(body, callback) {
    if (callback == null) {
      callback = function() {};
    }
    log(body);
    return this.simpleConfirm({
      header: 'An error occurred',
      body: body,
      callback: callback,
      buttons: [
        {
          text: 'OK',
          "class": 'btn btn-primary',
          close: true
        }
      ]
    });
  };

  Utils.prototype.simpleAlert = function(body, callback) {
    if (callback == null) {
      callback = function() {};
    }
    return this.simpleConfirm({
      header: '&nbsp;',
      body: body,
      callback: callback,
      buttons: [
        {
          text: 'Done',
          "class": 'btn btn-primary',
          close: true
        }
      ]
    });
  };

  Utils.prototype.simpleConfirm = function(options) {
    var id, modal;
    if (typeof options === 'string') {
      options = {
        body: options
      };
    }
    id = (+new Date()) + "_" + (parseDec(Math.random() * 10000));
    options = _.extend({}, {
      id: id,
      callback: function() {},
      header: 'Confirm',
      body: 'Are you sure?',
      buttons: [
        {
          text: 'OK',
          "class": 'btn btn-primary',
          close: true
        }, {
          text: 'Cancel',
          "class": 'btn btn-secondary',
          close: true
        }
      ]
    }, options);
    $(require('./views/templates/modal')(options)).modal();
    modal = $('#' + options.id);
    modal.find('.btn-primary').unbind().click(function() {
      return options.callback(true);
    });
    return modal.find('.btn-secondary').unbind().click(function() {
      return options.callback(false);
    });
  };

  Utils.prototype.parseQueryString = function(queryString) {
    var a, i, name, name2, queryArray, stack, value;
    queryArray = queryString.split('&');
    stack = {};
    for (i in queryArray) {
      a = queryArray[i].split('=');
      name = a[0];
      value = (isNaN(a[1]) ? a[1] : parseFloat(a[1]));
      if (name.match(/(.*?)\[(.*?)]/)) {
        name = RegExp.$1;
        name2 = RegExp.$2;
        if (name2) {
          if (!(name in stack)) {
            stack[name] = {};
          }
          stack[name][name2] = value;
        } else {
          if (!(name in stack)) {
            stack[name] = [];
          }
          stack[name].push(value);
        }
      } else {
        stack[name] = value;
      }
    }
    return stack;
  };

  return Utils;

})();

module.exports = new Utils;
});

;require.register("views/facewall", function(exports, require, module) {
var FaceWallView, View,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

View = require('./view');

FaceWallView = (function(superClass) {
  extend(FaceWallView, superClass);

  function FaceWallView() {
    this.avatarInGridSize = bind(this.avatarInGridSize, this);
    this.flyToFeatured = bind(this.flyToFeatured, this);
    this.setThreeDee = bind(this.setThreeDee, this);
    this.updateSearchDisplay = bind(this.updateSearchDisplay, this);
    this.setupKeyboardEvents = bind(this.setupKeyboardEvents, this);
    this.resetRefreshedTimeout = bind(this.resetRefreshedTimeout, this);
    this.unfeatureEmployee = bind(this.unfeatureEmployee, this);
    this.featureEmployee = bind(this.featureEmployee, this);
    this.featureRandomEmployee = bind(this.featureRandomEmployee, this);
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    return FaceWallView.__super__.constructor.apply(this, arguments);
  }

  FaceWallView.prototype.columnWidth = constants.columnWidth;

  FaceWallView.prototype.useAutoSizing = constants.useAutoSizing;

  FaceWallView.prototype.useAutoSizingNextTime = constants.useAutoSizing;

  FaceWallView.prototype.paused = !constants.autoplay;

  FaceWallView.prototype.threedee = constants.threedee;

  FaceWallView.prototype.template = require('./templates/facewall');

  FaceWallView.prototype.cache_bust_image_counter = 0;

  FaceWallView.prototype.initialize = function() {
    var view;
    this.zindex = 200;
    view = this;
    this.collection = app.collections.employees;
    $(window).resize(function() {
      if (app.views.current_view === view && ((view.last_rendered_width !== $(window).width()) || (view.useAutoSizing === true))) {
        if (view.useAutoSizing) {
          view.useAutoSizingNextTime = true;
        }
        $('#loader').show();
        return view.render();
      }
    });
    return setInterval(function() {
      if (app.views.current_view === view && !view.paused) {
        return view.featureRandomEmployee();
      }
    }, 1000 * constants.autoplay_seconds);
  };

  FaceWallView.prototype.render = function() {
    var $employee, $fw, badBucket, employee_loaded, employees, employees_loaded, goodBucket, grid, view;
    view = this;
    this.last_rendered_width = $(window).width();
    if (!this.collection.toJSON().length) {
      return;
    }
    window.document.body.style.cssText = "opacity: 0; background: " + constants.styles.background;
    $(this.el).html(this.template);
    this.resetRefreshedTimeout();
    this.setThreeDee();
    setTimeout((function() {
      return window.document.body.style.cssText = "opacity: 1; background: " + constants.styles.background;
    }), 500);
    $fw = $(this.el).find('.facewall');
    $employee = function(employee, height, width) {
      return "<a data-email=\"" + employee.email + "\" class=\"employee facewall-flyin\" style=\"width: " + width + "px; height: " + height + "px;\">\n    <span class=\"name\">" + (employee.firstName.substr(0, 1) + employee.lastName.substr(0, 1)) + "</span>\n    <img class=\"photo\" src=\"" + (view.avatarInGridSize(employee.gravatar)) + "\" />\n</a>";
    };
    employees = _.shuffle(app.collections.employees.toJSON());
    this.grid = grid = this.getGrid(this.columnWidth);
    badBucket = [];
    goodBucket = [];
    _.each(employees, function(employee) {
      var employee_img;
      employee_img = new Image();
      employee_img.onload = function() {
        employee_loaded();
        return goodBucket.push(employee);
      };
      employee_img.onerror = function() {
        employee_loaded();
        return badBucket.push(employee);
      };
      return employee_img.src = view.avatarInGridSize(employee.gravatar);
    });
    employees_loaded = 0;
    employee_loaded = (function(_this) {
      return function() {
        var row_bucket, row_count;
        employees_loaded += 1;
        if (employees_loaded === employees.length) {
          row_bucket = [];
          row_count = 0;
          if (_this.useAutoSizingNextTime && goodBucket.length > 0) {
            _this.useAutoSizingNextTime = false;
            _this.columnWidth = (Math.sqrt(($(window).width() * $(window).height()) / goodBucket.length)) * (1 / 0.7);
            view.render();
          }
          _.each(goodBucket, function(employee) {
            var $row;
            if (row_bucket.length === grid.length) {
              $row = $("<div class=\"employee-row\"></div>");
              $fw.append($row);
              _.each(row_bucket, function(employee_in_row, index) {
                var width;
                width = grid[index];
                return setTimeout(function() {
                  ($('#loader').hide() === index && index === 0);
                  return $row.append($employee(employee_in_row, grid[0], width));
                }, ((row_count * grid.length) + index) * 30);
              });
              row_bucket = [];
              row_count += 1;
            }
            return row_bucket.push(employee);
          });
        }
      };
    })(this);
    $fw.undelegate('a.employee', 'click').delegate('a.employee', 'click', (function(_this) {
      return function(e) {
        var $e;
        view.paused = true;
        _this.resetRefreshedTimeout();
        $e = $(e.target);
        if ($e.parents('a.employee').length) {
          $e = $e.parents('a.employee');
        }
        if ($e.hasClass('featured-employee')) {
          return _this.unfeatureEmployee();
        } else {
          return _this.featureEmployee($e);
        }
      };
    })(this));
    return this.setupKeyboardEvents();
  };

  FaceWallView.prototype.featureRandomEmployee = function(attempts) {
    var employee;
    if (attempts == null) {
      attempts = 0;
    }
    attempts += 1;
    if (attempts > 100) {
      return;
    }
    employee = _.first(_.shuffle(this.collection.toJSON()));
    if (!$(this.el).find("a.employee[data-email='" + employee.email + "']").length) {
      return this.featureRandomEmployee(attempts);
    }
    this.search = '';
    this.updateSearchDisplay();
    this.unfeatureEmployee();
    return this.featureEmployee(employee.email);
  };

  FaceWallView.prototype.featureEmployee = function(string_or_$target) {
    var $fw, email, employee, employee_img, image_size, view;
    view = this;
    if (typeof string_or_$target === 'string') {
      email = string_or_$target;
    } else {
      email = string_or_$target.data('email');
    }
    if (!email) {
      return;
    }
    employee = (this.collection.find(function(employee) {
      return employee.get('email') === email;
    })).toJSON();
    if (!employee) {
      return;
    }
    $fw = $(this.el).find('.facewall');
    if ($fw.find("a.featured-employee[data-email='" + email + "']").length) {
      return;
    }
    this.unfeatureEmployee();
    view.zindex -= 1;
    $fw.find("a.employee[data-email='" + email + "']").addClass('featured').css({
      zIndex: view.zindex
    });
    if (this.threedee) {
      this.flyToFeatured();
    }
    image_size = 600;
    employee_img = new Image();
    view.zindex += 3;
    employee_img.onload = function() {
      $fw.find("a.featured-employee").fadeOut('fast', function() {
        return $(this).remove();
      });
      return $fw.append("<a data-email=\"" + employee.email + "\" class=\"employee featured featured-employee facewall-featureEmployee-and-flipInY\" style=\"z-index: " + view.zindex + "\">\n    <span class=\"name\">" + employee.firstName + "</span>\n    <span class=\"role\">" + employee.role + "</span>\n    <img class=\"photo\" src=\"" + employee.gravatar + "&s=" + image_size + "\" />\n</a>");
    };
    employee_img.onerror = function() {
      return view.unfeatureEmployee();
    };
    return employee_img.src = employee.gravatar + "&s=" + image_size;
  };

  FaceWallView.prototype.unfeatureEmployee = function() {
    var $fw;
    $fw = $(this.el).find('.facewall');
    $fw.find('.featured-employee').fadeOut('fast', function() {
      return $(this).remove();
    });
    return $fw.find('a.employee.featured:not(".featured-employee")').removeClass('featured');
  };

  FaceWallView.prototype.resetRefreshedTimeout = function() {
    var view;
    view = this;
    if (this.lastTouchTimeout) {
      clearTimeout(this.lastTouchTimeout);
    }
    return this.lastTouchTimeout = setTimeout(function() {
      view.cache_bust_image_counter++;
      return view.render();
    }, 1000 * constants.refresh_seconds);
  };

  FaceWallView.prototype.setupKeyboardEvents = function() {
    var $fw, view;
    view = this;
    this.search = '';
    $fw = $(this.el).find('.facewall');
    return $(window).unbind('keydown.facewall').bind('keydown.facewall', (function(_this) {
      return function(e) {
        var $employee_match, $featured, $naved_employee, direction, employee_match, employee_matches, i, len, new_search, ref;
        if (app.views.current_view !== view) {
          return;
        }
        if (view.suspend_keyboard) {
          return;
        }
        view.paused = true;
        _this.resetRefreshedTimeout();
        $featured = $fw.find('.featured:not(".featured-employee")');
        if (e.keyCode === 27) {
          if (_this.search === '') {
            _this.unfeatureEmployee();
          }
          _this.search = '';
          view.updateSearchDisplay();
          e.preventDefault();
        }
        if (e.keyCode === 32 && _this.search === '') {
          return _this.paused = !_this.paused;
        }
        if (e.keyCode === 51) {
          _this.search = '';
          _this.threedee = !_this.threedee;
          return _this.setThreeDee();
        }
        if ((65 <= (ref = e.keyCode) && ref <= 90) || e.keyCode === 32 || e.keyCode === 8 || e.keyCode === 222 || e.keyCode === 190) {
          new_search = _this.search;
          if (e.keyCode === 8) {
            new_search = new_search.substr(0, new_search.length - 1);
          } else if (e.keyCode === 222) {
            new_search += "'";
          } else {
            new_search += String.fromCharCode(e.keyCode).toLowerCase();
          }
          if (new_search.length > 1) {
            employee_matches = _this.collection.filter(function(e) {
              return (new RegExp(new_search.toLowerCase())).test((e.get('firstName') + ' ' + e.get('lastName')).toLowerCase());
            });
            if (employee_matches.length > 0) {
              _this.paused = true;
              for (i = 0, len = employee_matches.length; i < len; i++) {
                employee_match = employee_matches[i];
                $employee_match = $fw.find("a.employee[data-email='" + (employee_match.get('email')) + "']");
                if ($employee_match.length) {
                  _this.search = new_search;
                  _this.featureEmployee(employee_match.get('email'));
                  if (employee_matches.length === 1 && e.keyCode !== 8) {
                    _this.search = (employee_match.get('firstName') + ' ' + employee_match.get('lastName')).toLowerCase();
                  }
                  break;
                }
              }
            }
          } else {
            _this.search = new_search;
          }
          view.updateSearchDisplay();
          return false;
        }
        if (!$featured.length) {
          _this.featureEmployee($fw.find('.employee').first());
        }
        $naved_employee = false;
        switch (e.keyCode) {
          case 37:
            if ($featured.index() > 0) {
              $naved_employee = $featured.prev('.employee');
            } else {
              $naved_employee = $featured.parent().prev('.employee-row').find('.employee').last();
            }
            break;
          case 39:
            if ($featured.index() < _this.grid.length - 1) {
              $naved_employee = $featured.next('.employee');
            } else {
              $naved_employee = $featured.parent().next('.employee-row').find('.employee').first();
            }
            break;
          case 38:
            $naved_employee = $featured.parent().prev('.employee-row').find('.employee').eq($featured.index());
            break;
          case 40:
            $naved_employee = $featured.parent().next('.employee-row').find('.employee').eq($featured.index());
            break;
          case 189:
          case 187:
            direction = e.keyCode === 189 ? -1 : 1;
            view.columnWidth += direction * 20;
            view.useAutoSizing = false;
            view.useAutoSizingNextTime = false;
            view.render();
            e.preventDefault();
        }
        if ($naved_employee) {
          _this.paused = true;
          _this.featureEmployee($naved_employee);
          return e.preventDefault();
        }
      };
    })(this));
  };

  FaceWallView.prototype.updateSearchDisplay = function() {
    var $search, search;
    $search = $(this.el).find('.facewall-search');
    if (this.search === '') {
      return $search.removeClass('facewall-search-opened').removeClass('facewall-flyin');
    } else {
      search = _.map(this.search.split(' '), function(w) {
        return _.map(w.split("'"), function(p) {
          return _.capitalize(p);
        }).join("'");
      }).join('&nbsp;');
      return $search.addClass('facewall-flyin').addClass('facewall-search-opened').html(search);
    }
  };

  FaceWallView.prototype.getOptimumGridColumnWidths = function(options) {
    var candidateWidth, currentBestNumColumns, currentBestWidth, i, num, numColumns, ref, ref1, remainder;
    currentBestWidth = options.width;
    currentBestNumColumns = 1;
    for (numColumns = i = ref = options.minColumns, ref1 = options.maxColumns; ref <= ref1 ? i < ref1 : i > ref1; numColumns = ref <= ref1 ? ++i : --i) {
      candidateWidth = parseInt(options.width / numColumns, 10);
      if ((options.minWidth < candidateWidth && candidateWidth < options.maxWidth)) {
        currentBestWidth = candidateWidth;
        currentBestNumColumns = numColumns;
      }
    }
    remainder = options.width % currentBestWidth;
    return (function() {
      var j, ref2, results;
      results = [];
      for (num = j = 1, ref2 = currentBestNumColumns; 1 <= ref2 ? j <= ref2 : j >= ref2; num = 1 <= ref2 ? ++j : --j) {
        results.push(currentBestWidth + (num === currentBestNumColumns ? remainder : 0));
      }
      return results;
    })();
  };

  FaceWallView.prototype.getGrid = function(columnWidth, attempts) {
    var grid, options;
    options = {
      width: $(window).width(),
      minColumns: 5,
      maxColumns: 100,
      minWidth: parseInt(columnWidth * 0.7, 10),
      maxWidth: parseInt(columnWidth * 1.3, 10)
    };
    attempts = attempts || 0;
    grid = this.getOptimumGridColumnWidths(options);
    if (attempts > 20) {
      return grid;
    }
    if (grid.length === 1) {
      options.width -= 1;
      return this.getGrid(options, attempts + 1);
    } else {
      return grid;
    }
  };

  FaceWallView.prototype.setThreeDee = function() {
    $(this.el).find('.facewall')[(this.threedee ? 'add' : 'remove') + "Class"]('facewall-threedee');
    if (this.threedee) {
      return this.flyToFeatured();
    } else {
      this.unfeatureEmployee();
      return $('.facewall-styles').html('');
    }
  };

  FaceWallView.prototype.flyToFeatured = function() {
    var $featured, column_index, row_index, translateX, translateY;
    $featured = $(this.el).find('.facewall').find('.featured:not(".featured-employee")');
    if (!$featured.length) {
      return;
    }
    row_index = $featured.parent().index();
    column_index = $featured.index();
    translateX = ($(window).width() / 2) - ((column_index + 0.5) * this.grid[0]);
    translateY = ($(window).height() / 2) - ((row_index + 0.5) * this.grid[0]);
    return $('.facewall-styles').html("<style>\n    .employee {\n        -webkit-transform: translateX(" + translateX + "px) translateY(" + translateY + "px) translateZ(100px) !important;\n    }\n    .employee.featured {\n        -webkit-transform: translateX(" + translateX + "px) translateY(" + translateY + "px) translateZ(330px) !important;\n    }\n</style>");
  };

  FaceWallView.prototype.avatarInGridSize = function(url) {
    return url + "&s=" + this.grid[0] + "&_=" + this.cache_bust_image_counter;
  };

  return FaceWallView;

})(View);

module.exports = FaceWallView;
});

;require.register("views/facewallGame", function(exports, require, module) {
var Employees, FaceWallGameView, HighScores, HighScoresView, View, pageHasBeenTamperedWith, score,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

View = require('./view');

HighScoresView = require('./highScores');

Employees = require('collections/employees');

HighScores = require('collections/highScores');

pageHasBeenTamperedWith = false;

score = {
  guessedCorrectly: 0,
  guessedIncorrectly: 0
};

FaceWallGameView = (function(superClass) {
  extend(FaceWallGameView, superClass);

  function FaceWallGameView() {
    this.setUpIphoneStuff = bind(this.setUpIphoneStuff, this);
    this.updateScoreBoard = bind(this.updateScoreBoard, this);
    this.nextQuestion = bind(this.nextQuestion, this);
    this.startGame = bind(this.startGame, this);
    this.setupScoreSubmission = bind(this.setupScoreSubmission, this);
    this.renderLoggedInUser = bind(this.renderLoggedInUser, this);
    this.renderSidebars = bind(this.renderSidebars, this);
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    return FaceWallGameView.__super__.constructor.apply(this, arguments);
  }

  FaceWallGameView.prototype.template = require('./templates/facewallGame');

  FaceWallGameView.prototype.initialize = function() {
    var view;
    view = this;
    this.collection = app.collections.employees;
    this.setUpIphoneStuff();
    if (env.env !== 'local') {
      return chrome.inspector.detector.watch(function(detector) {
        if (detector.open) {
          return pageHasBeenTamperedWith = true;
        }
      });
    }
  };

  FaceWallGameView.prototype.render = function() {
    var employee_loaded, employees, gameStarted, view;
    view = this;
    this.last_rendered_width = $(window).width();
    if (!this.collection.toJSON().length) {
      return;
    }
    window.document.body.style.cssText = 'opacity: 0; background: #fff';
    $(this.el).html(this.template({
      company_name: constants.company_name
    }));
    setTimeout((function() {
      return window.document.body.style.cssText = 'opacity: 1; background: #fff';
    }), 500);
    this.$fw = $(this.el).find('.facewall');
    employees = app.collections.employees.toJSON();
    this.goodEmployees = [];
    _.each(employees, function(employee) {
      var employee_img;
      employee_img = new Image();
      employee_img.onload = function() {
        employee_loaded();
        return view.goodEmployees.push(employee);
      };
      employee_img.onerror = function() {
        return employee_loaded();
      };
      return employee_img.src = employee.gravatar + "&s=160";
    });
    gameStarted = false;
    return employee_loaded = (function(_this) {
      return function() {
        if (view.goodEmployees.length === 20 && !gameStarted) {
          gameStarted = true;
          _this.renderSidebars();
          _this.renderLoggedInUser();
          _this.setupScoreSubmission();
          return _this.startGame();
        }
      };
    })(this);
  };

  FaceWallGameView.prototype.$employee = function(employee, size, randex) {
    return "<a data-email=\"" + employee.email + "\" data-randex=\"" + randex + "\" class=\"employee facewall-fadein\" style=\"top: " + (randex * size) + "px\">\n    <span class=\"name\">" + employee.firstName + " " + employee.lastName + "</span>\n    <img class=\"photo\" src=\"" + employee.gravatar + "&s=" + size + "\" />\n</a>";
  };

  FaceWallGameView.prototype.renderSidebars = function() {
    var $sidebarsLeft, $sidebarsRight, renderSidebars, view;
    view = this;
    $sidebarsLeft = this.$fw.find('.employee-sidebar.left');
    $sidebarsRight = this.$fw.find('.employee-sidebar.right');
    renderSidebars = function($sidebars) {
      var randex, shuffdex, swapDudes;
      $sidebars.removeClass('hidden');
      shuffdex = function() {
        return _.shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      };
      randex = shuffdex();
      _.each(_.shuffle(view.goodEmployees).slice(0, 10), function(employee, index) {
        return _.each($sidebars, function(sidebar) {
          return $(sidebar).append(view.$employee(employee, 160, randex[index]));
        });
      });
      swapDudes = function() {
        return;
        randex = shuffdex();
        return _.each(_.shuffle(view.goodEmployees).slice(0, 10), function(employee, index) {
          return setTimeout(function() {
            var rand;
            rand = randex[index];
            return _.each($sidebars, function(sidebar) {
              var $remove, $sidebar;
              $sidebar = $(sidebar);
              $sidebar.append(view.$employee(employee, 160, rand));
              $remove = $sidebar.find(".employee[data-randex='" + rand + "']").first();
              $remove.addClass('facewall-fadein').find('.name').remove();
              setTimeout((function() {
                return $remove.remove();
              }), 3 * 1000);
              if (index === 10 - 1 && app.views.current_view === view) {
                return swapDudes();
              }
            });
          }, index * 2 * 1000);
        });
      };
      return swapDudes();
    };
    renderSidebars($sidebarsLeft);
    return renderSidebars($sidebarsRight);
  };

  FaceWallGameView.prototype.renderLoggedInUser = function() {
    var email, employee, employeeModel, ref;
    if (((ref = app.login) != null ? ref.context : void 0) == null) {
      return;
    }
    email = app.login.context.user.email;
    employeeModel = app.collections.employees.where({
      email: email
    })[0];
    if (!employeeModel) {
      return utils.simpleError("<p>We're sorry but the email address <b>" + email + "</b> could not be found in HubSpot's employee database.</p>\n<p>Please contact the Help Desk to sort that out. In the meantime, you can still use Facewall anonymously!</p>");
    } else {
      employee = employeeModel.toJSON();
      return $('.logged-in-employee').html("<a data-email=\"" + employee.email + "\" class=\"employee facewall-fadein\">\n    <span class=\"name\">" + employee.firstName + " " + employee.lastName + "</span>\n    <img class=\"photo\" src=\"" + employee.gravatar + "&s=160\" />\n</a>");
    }
  };

  FaceWallGameView.prototype.setupScoreSubmission = function() {
    var email, employee, employeeModel, ref, render;
    if (((ref = app.login) != null ? ref.context : void 0) == null) {
      return;
    }
    email = app.login.context.user.email;
    employeeModel = app.collections.employees.where({
      email: email
    })[0];
    if (!employeeModel) {
      return;
    }
    employee = employeeModel.toJSON();
    render = function() {
      var highScoresView;
      highScoresView = new HighScoresView();
      return highScoresView.render(function(html) {
        return $('.modal-high-scores-list').html(html);
      });
    };
    return $('.score-board').unbind('click').click(function() {
      if (pageHasBeenTamperedWith) {
        utils.simpleError("<p>Sorry, we detected that you opened the console at one point or another during gameplay.</p>\n<p>So forgive us, but we don't want to allow you to submit your score in case you cheated.</p>");
      } else {
        utils.simpleAlert("<p class=\"facewall-styled clearfix\">Submit score of " + score.guessedCorrectly + " out of " + (score.guessedCorrectly + score.guessedIncorrectly) + "? <a class=\"btn submit-score-button\">Submit Score</a></p>\n<p class=\"facewall-styled submit-score-success hidden\">Successfully added your high score.</p>\n<div class=\"modal-high-scores-list\"></div>");
        render();
        return $('.submit-score-button').click(function() {
          return $.ajax({
            type: 'POST',
            url: app.collections.highScores.url(),
            dataType: 'text',
            data: {
              email: employee.email,
              name: employee.firstName + ' ' + employee.lastName,
              score: score.guessedCorrectly + '\/' + (score.guessedCorrectly + score.guessedIncorrectly)
            },
            success: function() {
              $('.submit-score-success').removeClass('hidden').prev('p').remove();
              return render();
            }
          });
        });
      }
    });
  };

  FaceWallGameView.prototype.startGame = function() {
    this.nextQuestion();
    this.updateScoreBoard();
    return this.setUpIphoneStuff();
  };

  FaceWallGameView.prototype.nextQuestion = function() {
    var $current, $guesses, currentEmployee, currentImageLoader, currentSize, employeeGuesses, remove, removeAndRender, render, thingsLeftBeforeRender, view;
    view = this;
    currentSize = 400;
    $current = this.$fw.find('.current-employee');
    $guesses = this.$fw.find('.possible-names');
    employeeGuesses = _.shuffle(view.goodEmployees).splice(0, 10);
    currentEmployee = _.shuffle(employeeGuesses)[0];
    thingsLeftBeforeRender = 1;
    currentImageLoader = new Image();
    currentImageLoader.onload = (function(_this) {
      return function() {
        $current.removeClass('guessed-correctly').html(_this.$employee(currentEmployee, currentSize, 0));
        $current.find('.name').remove();
        return removeAndRender();
      };
    })(this);
    currentImageLoader.src = currentEmployee.gravatar + "&s=" + currentSize;
    removeAndRender = function() {
      return remove(render);
    };
    remove = function(callback) {
      if (!$guesses.find('.employee').length) {
        return callback();
      } else {
        $guesses.find('.employee.guessed-correctly').css({
          opacity: 0
        });
        $guesses.find('.employee').remove();
        return callback();
      }
    };
    return render = function() {
      $guesses.removeClass('guessed-correctly');
      _.each(employeeGuesses, function(employee, index) {
        return setTimeout(function() {
          var $employee;
          $employee = $(view.$employee(employee, 40, index));
          $employee.find('.name').html("<span class=\"first-name\">" + employee.firstName + "&nbsp;</span><span class=\"last-name\">" + employee.lastName + "</span>");
          return $guesses.prepend($employee);
        }, index * 50);
      });
      return $guesses.undelegate('.employee', 'click').delegate('.employee', 'click', function(e) {
        var $employee;
        $employee = $(e.target);
        if ($employee.parents('.employee').length) {
          $employee = $employee.parents('.employee');
        }
        if ($employee.data('email') === currentEmployee.email) {
          $guesses.undelegate('.employee', 'click');
          $guesses.addClass('guessed-correctly');
          $current.addClass('guessed-correctly');
          $employee.addClass('guessed-correctly');
          score.guessedCorrectly++;
          setTimeout(function() {
            return view.nextQuestion();
          }, 500);
        } else {
          score.guessedIncorrectly++;
          $employee.addClass('guessed');
        }
        return view.updateScoreBoard();
      });
    };
  };

  FaceWallGameView.prototype.updateScoreBoard = function() {
    this.$fw.find('.score-board .guessed-correctly').html(score.guessedCorrectly);
    return this.$fw.find('.score-board .guessed-incorrectly').html(score.guessedCorrectly + score.guessedIncorrectly);
  };

  FaceWallGameView.prototype.setUpIphoneStuff = function() {
    var view;
    view = this;
    $(window).resize(function() {
      if (app.views.current_view === view && $(window).width() <= 768) {
        $('.current-employee').css({
          height: $(window).width(),
          width: $(window).width()
        });
        return $('.possible-names').css({
          top: $(window).width(),
          height: $(window).height() - $(window).width()
        });
      }
    });
    return $(window).resize();
  };

  return FaceWallGameView;

})(View);

module.exports = FaceWallGameView;
});

;require.register("views/highScores", function(exports, require, module) {
var HighScoresView, View,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

View = require('./view');

HighScoresView = (function(superClass) {
  extend(HighScoresView, superClass);

  function HighScoresView() {
    this.render = bind(this.render, this);
    this.initialize = bind(this.initialize, this);
    return HighScoresView.__super__.constructor.apply(this, arguments);
  }

  HighScoresView.prototype.initialize = function() {
    return this.collection = app.collections.highScores;
  };

  HighScoresView.prototype.$score = function(score) {
    return "<a data-email=\"" + score.email + "\" class=\"employee employee-high-score\">\n    <span class=\"name\">" + score.name + "</span>\n    <span class=\"score\">" + score.score + "</span>\n    <img class=\"photo\" src=\"https://secure.gravatar.com/avatar/" + (CryptoJS.MD5(score.email.toLowerCase())) + "?d=404&s=160\" />\n</a>";
  };

  HighScoresView.prototype.render = function(callback) {
    var _render;
    this.collection.fetch({
      error: function() {
        return utils.simpleError("An error occurred while trying to load " + constants.company_name + " Facewall Game high scores.");
      },
      success: function() {
        return _render();
      }
    });
    return _render = (function(_this) {
      return function() {
        var html;
        html = '';
        _.each(_.first(_this.collection.toJSON(), 100), function(score) {
          return html += _this.$score(score);
        });
        return callback(html);
      };
    })(this);
  };

  return HighScoresView;

})(View);

module.exports = HighScoresView;
});

;require.register("views/navigation", function(exports, require, module) {
var NavigationView, View,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

View = require('./view');

NavigationView = (function(superClass) {
  extend(NavigationView, superClass);

  function NavigationView() {
    this.renderTitle = bind(this.renderTitle, this);
    this.render = bind(this.render, this);
    return NavigationView.__super__.constructor.apply(this, arguments);
  }

  NavigationView.prototype.render = function() {
    return this.renderTitle();
  };

  NavigationView.prototype.renderTitle = function() {
    var subtitle;
    subtitle = utils.getHTMLTitleFromHistoryFragment(Backbone.history.fragment);
    if (subtitle !== '') {
      subtitle = ' — ' + subtitle;
    }
    return $('head title').text("Facewall" + subtitle);
  };

  return NavigationView;

})(View);

module.exports = NavigationView;
});

;require.register("views/page_not_found", function(exports, require, module) {
var H, PageNotFoundView, Particle, View, W, animloop, canvas, ctx, dist, distance, draw, ever_rendered, i, minDist, paintCanvas, particleCount, particles, update,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

View = require('./view');

H = void 0;

Particle = void 0;

W = void 0;

animloop = void 0;

canvas = void 0;

ctx = void 0;

dist = void 0;

distance = void 0;

draw = void 0;

i = void 0;

minDist = void 0;

paintCanvas = void 0;

particleCount = void 0;

particles = void 0;

update = void 0;

ever_rendered = false;

PageNotFoundView = (function(superClass) {
  extend(PageNotFoundView, superClass);

  function PageNotFoundView() {
    this.render = bind(this.render, this);
    return PageNotFoundView.__super__.constructor.apply(this, arguments);
  }

  PageNotFoundView.prototype.template = require('./templates/404');

  PageNotFoundView.prototype.render = function() {
    $(this.el).html(this.template);
    canvas = document.getElementById("page-not-found-canvas");
    ctx = canvas.getContext("2d");
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    particleCount = 150;
    particles = [];
    minDist = 70;
    dist = void 0;
    i = 0;
    while (i < particleCount) {
      particles.push(new Particle());
      i++;
    }
    return animloop();
  };

  return PageNotFoundView;

})(View);

window.requestAnimFrame = (function() {
  return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(callback) {
    return window.setTimeout(callback, 1000 / 60);
  };
})();

paintCanvas = function() {
  ctx.fillStyle = $('body').css('background-color');
  return ctx.fillRect(0, 0, W, H);
};

Particle = function() {
  this.x = Math.random() * W;
  this.y = Math.random() * H;
  this.vx = -1 + Math.random() * 2;
  this.vy = -1 + Math.random() * 2;
  this.radius = 4;
  this.draw = function() {
    ctx.fillStyle = "rgb(" + constants.styles.color_rgb + ")";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    return ctx.fill();
  };
};

draw = function() {
  var p;
  i = void 0;
  p = void 0;
  paintCanvas();
  i = 0;
  while (i < particles.length) {
    p = particles[i];
    p.draw();
    i++;
  }
  return update();
};

update = function() {
  var _results, j, p, p2;
  i = void 0;
  j = void 0;
  p = void 0;
  p2 = void 0;
  _results = void 0;
  i = 0;
  _results = [];
  while (i < particles.length) {
    p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    if (p.x + p.radius > W) {
      p.x = p.radius;
    } else {
      if (p.x - p.radius < 0) {
        p.x = W - p.radius;
      }
    }
    if (p.y + p.radius > H) {
      p.y = p.radius;
    } else {
      if (p.y - p.radius < 0) {
        p.y = H - p.radius;
      }
    }
    j = i + 1;
    while (j < particles.length) {
      p2 = particles[j];
      distance(p, p2);
      j++;
    }
    _results.push(i++);
  }
  return _results;
};

distance = function(p1, p2) {
  var ax, ay, dx, dy;
  ax = void 0;
  ay = void 0;
  dist = void 0;
  dx = void 0;
  dy = void 0;
  dist = void 0;
  dx = p1.x - p2.x;
  dy = p1.y - p2.y;
  dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= minDist) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(" + constants.styles.color_rgb + "," + (1.2 - dist / minDist) + ")";
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.closePath();
    ax = dx / 2000;
    ay = dy / 2000;
    p1.vx -= ax;
    p1.vy -= ay;
    p2.vx += ax;
    return p2.vy += ay;
  }
};

animloop = function() {
  draw();
  if ($('#page-not-found-canvas').length) {
    return requestAnimFrame(animloop);
  }
};

module.exports = PageNotFoundView;
});

;require.register("views/templates/404", function(exports, require, module) {
var __templateData = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<header class=\"jumbotron subhead page-not-found-header\" id=\"overview\">\n    <h1>Page not found</h1>\n    <p class=\"lead\">Hmmmm... didn't work out like you'd hoped?</p>\n    <p class=\"lead\"><a href=\"\">Take me home</a></p>\n</header>\n\n<div id=\"facewall-web\">\n    <canvas id=\"page-not-found-canvas\"></canvas>\n</div>";
},"useData":true});
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/facewall", function(exports, require, module) {
var __templateData = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<style>\n    html, body {\n        overflow: hidden;\n    }\n\n    ::-webkit-scrollbar {\n        display: none;\n    }\n</style>\n\n<div class=\"full-screen-fixed facewall with-scroll\"></div>\n<div class=\"facewall-search\"></div>\n<div class=\"facewall-styles\"></div>";
},"useData":true});
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/facewallGame", function(exports, require, module) {
var __templateData = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper;

  return "<style>\n    html, body {\n        overflow: hidden;\n    }\n\n    ::-webkit-scrollbar {\n        display: none;\n    }\n\n    @-moz-document url-prefix() {\n        h1 {\n            color: red;\n        }\n\n        .employee .name .first-name {\n            line-height: 24px;\n        }\n    }\n</style>\n\n<div class=\"full-screen-fixed facewall facewall-game with-scroll\">\n    <div class=\"game-title\">\n        <span class=\"small-label\">"
    + container.escapeExpression(((helper = (helper = helpers.company_name || (depth0 != null ? depth0.company_name : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"company_name","hash":{},"data":data}) : helper)))
    + "'s</span>\n        Facewall,<span style=\"display: inline-block; width: 3px\"> </span>The<span style=\"display: inline-block; width: 9px\"> </span>Game\n    </div>\n    <div class=\"score-board\">\n        <span class=\"small-label\"><span class=\"post-score-label\">Submit </span>Score</span>\n        <span class=\"guessed-correctly\"></span><span class=\"slash\">/</span><span class=\"guessed-incorrectly\"></span>\n        <span class=\"logged-in-employee\"></span>\n    </div>\n    <div class=\"employee-sidebar-wrapper\">\n        <div class=\"employee-sidebar left top hidden\"></div>\n        <div class=\"employee-sidebar left bottom hidden\"></div>\n    </div>\n    <div class=\"employee-sidebar-wrapper\">\n        <div class=\"employee-sidebar right top hidden\"></div>\n        <div class=\"employee-sidebar right bottom hidden\"></div>\n    </div>\n    <div class=\"game-window\">\n        <div class=\"current-employee\"></div>\n        <div class=\"possible-names\"></div>\n    </div>\n</div>";
},"useData":true});
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/templates/modal", function(exports, require, module) {
var __templateData = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper;

  return "id=\""
    + container.escapeExpression(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"id","hash":{},"data":data}) : helper)))
    + "\"";
},"3":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {};

  return "            <a href=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.href : depth0),{"name":"if","hash":{},"fn":container.program(4, data, 0),"inverse":container.program(6, data, 0),"data":data})) != null ? stack1 : "")
    + "\" class=\""
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0["class"] : depth0),{"name":"if","hash":{},"fn":container.program(8, data, 0),"inverse":container.program(10, data, 0),"data":data})) != null ? stack1 : "")
    + "\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.close : depth0),{"name":"if","hash":{},"fn":container.program(12, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">"
    + container.escapeExpression(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</a>\n";
},"4":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers.href || (depth0 != null ? depth0.href : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"href","hash":{},"data":data}) : helper)));
},"6":function(container,depth0,helpers,partials,data) {
    return "#";
},"8":function(container,depth0,helpers,partials,data) {
    var helper;

  return container.escapeExpression(((helper = (helper = helpers["class"] || (depth0 != null ? depth0["class"] : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"class","hash":{},"data":data}) : helper)));
},"10":function(container,depth0,helpers,partials,data) {
    return "btn";
},"12":function(container,depth0,helpers,partials,data) {
    return "data-dismiss=\"modal\"";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function";

  return "<div class=\"modal\" "
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.id : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + ">\n    <div class=\"modal-header\">\n        <button type=\"button\" class=\"close\" data-dismiss=\"modal\">×</button>\n        <h3>"
    + ((stack1 = ((helper = (helper = helpers.header || (depth0 != null ? depth0.header : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"header","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</h3>\n    </div>\n    <div class=\"modal-body\">\n        "
    + ((stack1 = ((helper = (helper = helpers.body || (depth0 != null ? depth0.body : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"body","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n    </div>\n    <div class=\"modal-footer\">\n"
    + ((stack1 = (helpers.eachWithFn || (depth0 && depth0.eachWithFn) || alias2).call(alias1,(depth0 != null ? depth0.buttons : depth0),{"name":"eachWithFn","hash":{},"fn":container.program(3, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "    </div>\n</div>";
},"useData":true});
if (typeof define === 'function' && define.amd) {
  define([], function() {
    return __templateData;
  });
} else if (typeof module === 'object' && module && module.exports) {
  module.exports = __templateData;
} else {
  __templateData;
}
});

;require.register("views/view", function(exports, require, module) {
var View,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

require('lib/view_helper');

View = (function(superClass) {
  extend(View, superClass);

  function View() {
    this.routeLink = bind(this.routeLink, this);
    return View.__super__.constructor.apply(this, arguments);
  }

  View.prototype.el = '#page';

  View.prototype.events = {
    'click a': 'routeLink'
  };

  View.prototype.routeLink = function(e) {
    var $link, url;
    $link = $(e.target);
    url = $link.attr('href');
    if ($link.attr('target') === '_blank' || typeof url === 'undefined' || url.substr(0, 4) === 'http') {
      return true;
    }
    e.preventDefault();
    if (url.indexOf('.') === 0) {
      url = url.substring(1);
      if (url.indexOf('/') === 0) {
        url = url.substring(1);
      }
    }
    if ($link.data('route') || $link.data('route') === '') {
      url = $link.data('route');
    }
    return app.router.navigate(url, {
      trigger: true
    });
  };

  return View;

})(Backbone.View);

module.exports = View;
});

;
//# sourceMappingURL=app.js.map