const Lab = require('lab')
const lab = exports.lab = Lab.script()

const buildServer = require('../test-server')
const server = buildServer()
const Factory = require('../../../udaru-core/test/factory')
const { BuildFor, udaru } = require('./testBuilder')

const organizationId = 'WONKA'
function Policy (Statement) {
  return {
    version: '2016-07-01',
    name: 'Test Policy',
    statements: JSON.stringify({
      Statement: Statement || [{
        Effect: 'Allow',
        Action: ['dummy'],
        Resource: ['dummy']
      }]
    }),
    organizationId
  }
}

lab.experiment('Routes Authorizations', () => {
  lab.experiment('authorization', () => {
    lab.experiment('GET /authorization/access/{userId}/{action}/{resource*}', () => {
      const records = Factory(lab, {
        users: {
          caller: { name: 'caller', organizationId, policies: [{id: 'testedPolicy'}] }
        },
        policies: {
          testedPolicy: Policy()
        }
      }, udaru)

      let endpoint = BuildFor(lab, records)
        .server(server)
        .endpoint({
          method: 'GET',
          url: '/authorization/access/Modifyid/action_a/resource_a',
          headers: { authorization: '{{caller.id}}' }
        })

      endpoint.test('should authorize user with correct policy')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:access'],
          Resource: ['authorization/access']
        }])
        .shouldRespond(200)

      endpoint.test('should not authorize user with incorrect policy (action)')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:dummy'],
          Resource: ['authorization/access']
        }])
        .shouldRespond(403)

      endpoint.test('should not authorize user with incorrect policy (resource)')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:access'],
          Resource: ['authorization/dummy']
        }])
        .shouldRespond(403)
    })

    lab.experiment('POST /authorization/access/{userId}', () => {
      const records = Factory(lab, {
        users: {
          caller: { name: 'caller', organizationId, policies: [{id: 'testedPolicy'}] }
        },
        policies: {
          testedPolicy: Policy()
        }
      }, udaru)

      let endpoint = BuildFor(lab, records)
        .server(server)
        .endpoint({
          method: 'POST',
          url: '/authorization/access/Modifyid',
          payload: {
            resourceBatch: [{
              resource: 'resource_a',
              action: 'action_a'
            }]
          },
          headers: { authorization: '{{caller.id}}' }
        })

      endpoint.test('should authorize user with correct policy')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:batch:access'],
          Resource: ['authorization/batchaccess']
        }])
        .shouldRespond(200)

      endpoint.test('should not authorize user with incorrect policy (action)')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:batch:dummy'],
          Resource: ['authorization/access']
        }])
        .shouldRespond(403)

      endpoint.test('should not authorize user with incorrect policy (resource)')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:batch:access'],
          Resource: ['authorization/dummy']
        }])
        .shouldRespond(403)
    })

    lab.experiment('GET /authorization/list/{userId}/{resource*}', () => {
      const records = Factory(lab, {
        users: {
          caller: { name: 'caller', organizationId, policies: [{id: 'testedPolicy'}] }
        },
        policies: {
          testedPolicy: Policy()
        }
      }, udaru)

      const endpoint = BuildFor(lab, records)
        .server(server)
        .endpoint({
          method: 'GET',
          url: '/authorization/list/ModifyId/not/my/resource',
          headers: { authorization: '{{caller.id}}' }
        })

      endpoint.test('should authorize user with correct policy')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:actions'],
          Resource: ['authorization/actions']
        }])
        .shouldRespond(200)

      endpoint.test('should not authorize user with incorrect policy (action)')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:dummy'],
          Resource: ['authorization/actions']
        }])
        .shouldRespond(403)

      endpoint.test('should not authorize user with incorrect policy (resource)')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:actions'],
          Resource: ['authorization/dummy']
        }])
        .shouldRespond(403)
    })

    lab.experiment('GET /authorization/list/{userId}', () => {
      const records = Factory(lab, {
        users: {
          caller: { name: 'caller', organizationId, policies: [{id: 'testedPolicy'}] }
        },
        policies: {
          testedPolicy: Policy()
        }
      }, udaru)

      const endpoint = BuildFor(lab, records)
        .server(server)
        .endpoint({
          method: 'GET',
          url: '/authorization/list/ModifyId?resources=not/my/resource',
          headers: { authorization: '{{caller.id}}' }
        })

      endpoint.test('should authorize user with correct policy')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:resources:actions'],
          Resource: ['authorization/actions/resources']
        }])
        .shouldRespond(200)

      endpoint.test('should not authorize user with incorrect policy (action)')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:dummy'],
          Resource: ['authorization/actions']
        }])
        .shouldRespond(403)

      endpoint.test('should not authorize user with incorrect policy (resource)')
        .withPolicy([{
          Effect: 'Allow',
          Action: ['authorization:authn:actions:resources'],
          Resource: ['authorization/dummy']
        }])
        .shouldRespond(403)
    })
  })
})
