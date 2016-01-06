Collection = require './collection'

# By default, email addresses with no Gravatars will be hidden from the Facewall.
# However, adding ?shame to the request URL will show these as empty squares in the Facewall mesh.
defaultGravatarImage = if location.search isnt '?shame' then '404' else 'blank'

USER_JSON = """{"users":[{"firstName":"Kashyap","lastName":"Mukkamala","email":"kmukkamala@egen.solutions"},{"firstName":"Divyanshu","lastName":"Mittal","email":"mittal.divyanshu046@gmail.com"},{"firstName":"Kesava","lastName":"Sreeram","email":"movetojunk2@gmail.com"},{"firstName":"Nitika","lastName":"Khanna","email":"nkhanna@egen.solutions"},{"firstName":"Nitin","lastName":"Ankam","email":"nankam@egen.solutions"},{"firstName":"Sai Teja","lastName":"Lingam","email":"saitejalingam@gmail.com"},{"firstName":"Sanket","lastName":"Patel","email":"sanketpatel.301090@gmail.com"},{"firstName":"Sandeep","lastName":"Jamithireddy","email":"sreddy@egen.solutions"},{"firstName":"Siddharth","lastName":"Soman","email":"ssoman@egen.solutions"},{"firstName":"Anurag","lastName":"Sharma","email":"ansharma@egen.solutions"},{"firstName":"Suki","lastName":"Baldwin","email":"accounts@egeni.com"},{"firstName":"Rajani","lastName":"Gurram","email":"rgurram@egen.solutions"},{"firstName":"Anusha","lastName":"Dwivedula","email":"anusha.dwivedula@gmail.com"},{"firstName":"Jake","lastName":"Smith","email":"Jakedx6@gmail.com"},{"firstName":"Kashyap","lastName":"Mukkamala","email":"kmukkamala@egen.solutions"},{"firstName":"Divyanshu","lastName":"Mittal","email":"mittal.divyanshu046@gmail.com"},{"firstName":"Kesava","lastName":"Sreeram","email":"movetojunk2@gmail.com"},{"firstName":"Nitika","lastName":"Khanna","email":"nkhanna@egen.solutions"},{"firstName":"Sandeep","lastName":"Hosangadi","email":"shosangadi@egen.solutions"}]}"""

class Employees extends Collection

    # Replace this with your own database of employees.
    # You may use a URL which returns JSON in the following format:
    # {
    #    "users":[
    #       {
    #          "id": 1,
    #          "createdAt": 1282254176000,
    #          "email": "aschwartz@hubspot.com",
    #          "firstName": "Adam",
    #          "lastName": "Schwartz",
    #          "role": "Principal Software Engineer"
    #       },
    #       // ...
    #    ]
    # }
    # url: -> "/my-organization-user-database"

    # Or you may hard code a JSON string in place of the example USER_JSON (see above)
    fetch: (options) ->
        @add @parse JSON.parse USER_JSON
        setTimeout (-> options.success()), 100

    parse: (data) ->
        _.map data.users, (employee) =>
            employee.gravatar = "https://secure.gravatar.com/avatar/#{CryptoJS.MD5(employee.email.toLowerCase())}?d=#{defaultGravatarImage}"

            # Default to showing full name when role is not available
            employee.role = employee.firstName + ' ' + employee.lastName unless employee.role

            employee

module.exports = Employees