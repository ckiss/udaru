'use strict'

const _ = require('lodash')
const Joi = require('joi')
const swagger = require('./../../swagger')
const headers = require('./../headers')
const validation = require('@nearform/udaru-core/lib/ops/validation').users

exports.register = function (server, options, next) {
  const Action = server.udaruConfig.get('AuthConfig.Action')

  server.route({
    method: 'GET',
    path: '/authorization/users',
    handler: function (request, reply) {
      const { organizationId } = request.udaru
      const limit = request.query.limit || server.udaruConfig.get('authorization.defaultPageSize')
      const page = request.query.page || 1

      request.udaruCore.users.list({ organizationId, limit, page }, (err, data, total) => {
        reply(
          err,
          err ? null : {
            page: page,
            limit: limit,
            total: total,
            data: data
          }
        )
      })
    },
    config: {
      description: 'Fetch all users from the current user organization',
      notes: 'The GET /authorization/users endpoint returns a list of all users from the current organization.\n\nThe results are paginated. Page numbering and page limit start from 1.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.ListUsers
        }
      },
      validate: {
        headers,
        query: _.pick(validation.listOrgUsers, ['page', 'limit'])
      },
      response: { schema: swagger.PagedUsers }
    }
  })

  server.route({
    method: 'GET',
    path: '/authorization/users/{id}',
    handler: function (request, reply) {
      const { organizationId } = request.udaru
      const id = request.params.id

      request.udaruCore.users.read({ id, organizationId }, reply)
    },
    config: {
      validate: {
        params: _.pick(validation.readUser, ['id']),
        headers
      },
      description: 'Fetch a user given its identifier',
      notes: 'The GET /authorization/users/{id} endpoint returns a single user data.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.ReadUser,
          getParams: (request) => ({ userId: request.params.id })
        }
      },
      response: { schema: swagger.User }
    }
  })

  server.route({
    method: 'POST',
    path: '/authorization/users',
    handler: function (request, reply) {
      const { organizationId } = request.udaru
      const { id, name, metadata } = request.payload

      request.udaruCore.users.create({ id, name, organizationId, metadata }, function (err, res) {
        if (err) {
          return reply(err)
        }

        return reply(res).code(201)
      })
    },
    config: {
      validate: {
        payload: Joi.object(_.pick(validation.createUser, ['id', 'name', 'metadata'])).label('CreateUserPayload'),
        headers
      },
      description: 'Create a new user',
      notes: 'The POST /authorization/users endpoint creates a new user given its data.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.CreateUser
        }
      },
      response: { schema: swagger.User }
    }
  })

  server.route({
    method: 'DELETE',
    path: '/authorization/users/{id}',
    handler: function (request, reply) {
      const { organizationId } = request.udaru
      const id = request.params.id

      request.udaruCore.users.delete({ id, organizationId }, function (err, res) {
        if (err) {
          return reply(err)
        }

        return reply().code(204)
      })
    },
    config: {
      validate: {
        params: _.pick(validation.deleteUser, ['id']),
        headers
      },
      description: 'Delete a user',
      notes: 'The DELETE /authorization/users/{id} endpoint deletes a user.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.DeleteUser,
          getParams: (request) => ({ userId: request.params.id })
        }
      }
    }
  })

  server.route({
    method: 'PUT',
    path: '/authorization/users/{id}',
    handler: function (request, reply) {
      const { organizationId } = request.udaru
      const id = request.params.id
      const { name, metadata } = request.payload

      const params = {
        id,
        organizationId,
        name,
        metadata
      }
      request.udaruCore.users.update(params, reply)
    },
    config: {
      validate: {
        params: _.pick(validation.updateUser, ['id']),
        payload: Joi.object(_.pick(validation.updateUser, ['name', 'metadata'])).label('UpdateUserPayload'),
        headers
      },
      description: 'Update a user',
      notes: 'The PUT /authorization/users/{id} endpoint updates the user data.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.UpdateUser,
          getParams: (request) => ({ userId: request.params.id })
        }
      },
      response: { schema: swagger.User }
    }
  })

  server.route({
    method: 'PUT',
    path: '/authorization/users/{id}/policies',
    handler: function (request, reply) {
      const { id } = request.params
      const { organizationId } = request.udaru
      const { policies } = request.payload

      const params = {
        id,
        organizationId,
        policies
      }
      request.udaruCore.users.addPolicies(params, reply)
    },
    config: {
      validate: {
        params: _.pick(validation.addUserPolicies, ['id']),
        payload: Joi.object(_.pick(validation.addUserPolicies, ['policies'])).label('AddUserPoliciesPayload'),
        headers
      },
      description: 'Add one or more policies to a user',
      notes: 'The PUT /authorization/users/{id}/policies endpoint adds one or more policies to a user.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.AddUserPolicy,
          getParams: (request) => ({ userId: request.params.id })
        }
      },
      response: { schema: swagger.User }
    }
  })

  server.route({
    method: 'POST',
    path: '/authorization/users/{id}/policies',
    handler: function (request, reply) {
      const { id } = request.params
      const { organizationId } = request.udaru
      const { policies } = request.payload

      const params = {
        id,
        organizationId,
        policies
      }

      request.udaruCore.users.replacePolicies(params, reply)
    },
    config: {
      validate: {
        params: _.pick(validation.replaceUserPolicies, ['id']),
        payload: Joi.object(_.pick(validation.replaceUserPolicies, ['policies'])).label('ReplaceUserPoliciesPayload'),
        headers
      },
      description: 'Clear and replace policies for a user',
      notes: 'The POST /authorization/users/{id}/policies endpoint replaces all the user policies. Existing user policies are removed.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.ReplaceUserPolicy,
          getParams: (request) => ({ userId: request.params.id })
        }
      },
      response: { schema: swagger.User }
    }
  })

  server.route({
    method: 'DELETE',
    path: '/authorization/users/{id}/policies',
    handler: function (request, reply) {
      const { id } = request.params
      const { organizationId } = request.udaru

      request.udaruCore.users.deletePolicies({ id, organizationId }, function (err, res) {
        if (err) {
          return reply(err)
        }

        return reply().code(204)
      })
    },
    config: {
      validate: {
        params: _.pick(validation.deleteUserPolicies, ['id']),
        headers
      },
      description: 'Clear all user\'s policies',
      notes: 'The DELETE /authorization/users/{id}/policies endpoint removes all the user policies.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.RemoveUserPolicy,
          getParams: (request) => ({ userId: request.params.id })
        }
      }
    }
  })

  server.route({
    method: 'DELETE',
    path: '/authorization/users/{userId}/policies/{policyId}',
    handler: function (request, reply) {
      const { userId, policyId } = request.params
      const { organizationId } = request.udaru

      request.udaruCore.users.deletePolicy({ userId, policyId, organizationId }, function (err, res) {
        if (err) {
          return reply(err)
        }

        return reply().code(204)
      })
    },
    config: {
      validate: {
        params: _.pick(validation.deleteUserPolicy, ['userId', 'policyId']),
        headers
      },
      description: 'Remove a user\'s policy',
      notes: 'The DELETE /authorization/users/{userId}/policies/{policyId} endpoint removes a specific user\'s policy.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.RemoveUserPolicy,
          getParams: (request) => ({
            userId: request.params.userId,
            policyId: request.params.policyId
          })
        }
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/authorization/users/{id}/teams',
    handler: function (request, reply) {
      const { id } = request.params
      const { organizationId } = request.udaru
      const limit = request.query.limit || server.udaruConfig.get('authorization.defaultPageSize')
      const page = request.query.page || 1

      request.udaruCore.users.read({ id, organizationId }, (err) => {
        if (err) return reply(err)

        request.udaruCore.users.listUserTeams({ id, organizationId, limit, page }, (err, data, total) => {
          reply(err, { page, limit, total, data })
        })
      })
    },
    config: {
      validate: {
        headers,
        params: _.pick(validation.listUserTeams, ['id']),
        query: _.pick(validation.listUserTeams, ['page', 'limit'])
      },
      description: 'Fetch all teams to which the user belongs to. Does not fetch parent teams.',
      notes: 'The GET /authorization/users/{id}/teams endpoint returns a list of teams to which the user belongs to.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.ListUserTeams,
          getParams: (request) => ({ userId: request.params.id })
        }
      },
      response: { schema: swagger.PagedTeamRefs }
    }
  })

  server.route({
    method: 'POST',
    path: '/authorization/users/{id}/teams',
    handler: function (request, reply) {
      const { id } = request.params
      const { organizationId } = request.udaru
      const { teams } = request.payload

      const params = {
        id,
        organizationId,
        teams
      }

      request.udaruCore.users.replaceTeams(params, reply)
    },
    config: {
      validate: {
        params: _.pick(validation.replaceUserTeams, ['id']),
        payload: Joi.object(_.pick(validation.replaceUserTeams, ['teams'])).label('ReplaceUserTeamsPayload'),
        headers
      },
      description: 'Clear and replace user teams',
      notes: 'The POST /authorization/users/{id}/teams endpoint replaces all the user teams. This can be use to move a user from a team to another (or a set of teams to another).\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.ReplaceUserTeams,
          getParams: (request) => ({ userId: request.params.id })
        }
      },
      response: { schema: swagger.User }
    }
  })

  server.route({
    method: 'DELETE',
    path: '/authorization/users/{id}/teams',
    handler: function (request, reply) {
      const { id } = request.params
      const { organizationId } = request.udaru

      const params = {
        id,
        organizationId
      }

      request.udaruCore.users.deleteTeams(params, reply)
    },
    config: {
      validate: {
        params: _.pick(validation.deleteUserFromTeams, ['id']),
        headers
      },
      description: 'Delete teams for a user',
      notes: 'The DELETE /authorization/users/{id}/teams endpoint deletes user from all her teams.\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.DeleteUserTeams,
          getParams: (request) => ({ userId: request.params.id })
        }
      },
      response: { schema: swagger.User }
    }
  })

  server.route({
    method: 'GET',
    path: '/authorization/users/search',
    handler: function (request, reply) {
      const { organizationId } = request.udaru
      const query = request.query.query

      request.udaruCore.users.search({
        organizationId,
        query
      }, (err, data, total) => {
        reply(
          err,
          err ? null : {
            data,
            total
          }
        )
      })
    },
    config: {
      description: 'Search for users from the current organization',
      notes: 'The get /authorization/users/search endpoint returns a filtered list of users from the current organization.\n\n',
      tags: ['api', 'users'],
      plugins: {
        auth: {
          action: Action.SearchUsers
        }
      },
      validate: {
        headers,
        query: _.pick(validation.searchUser, ['query'])
      },
      response: { schema: swagger.SearchUser }
    }
  })

  next()
}

exports.register.attributes = {
  name: 'users',
  version: '0.0.1'
}
