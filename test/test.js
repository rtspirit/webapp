const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../server');
const should = chai.should();
var assert = chai.assert; 
chai.use(chaiHttp)

 


describe('Array', () => {
    describe('Check the index', () => {
        it('return -1 when element is not found', () => {
            assert.equal([6,7,9].indexOf(1), -1);
        });
    });
});

 


describe('Test Password', () => {
    describe('test Password', () => {
       
        it('Password must be strong', () => {
            let password = "Netflix@2020"
            let valid=true;
            if (!/^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{8,}$/.test(password)) {
                valid=false;
            }
            assert.isTrue(valid);
        });
    });
});