var node_validator = require('../lib'),
    Validator = new node_validator.Validator();

module.exports = {
    'test #isEmail()': function(assert) {
        //Try some invalid emails
        var invalid = [
            'invalidemail@',
            'invalid.com',
            '@invalid.com'
        ];
        invalid.forEach(function(email) {
            try {
                Validator.check(email, 'Invalid').isEmail();
                assert.ok(false, 'Invalid email ('+email+') passed validation');
            } catch(e) {
                assert.equal('Invalid', e);
            }
        });
        
        //Now try some valid ones
        var valid = [
            'foo@bar.com',
            'x@x.x',
            'foo@bar.com.au',
            'foo+bar@bar.com'
        ];
        try {
            valid.forEach(function(email) {
                Validator.check(email).isEmail();
            });
        } catch(e) {
            assert.ok(false, 'A valid email did not pass validation');
        }
    },
    
    'test #isUrl()': function(assert) {
        //Try some invalid URLs
        var invalid = [
            'xyz://foobar.com', //Only http, https and ftp are valid
            'invalid/',
            'invalid.x',
            '.com',
            'http://com/',
            'http://300.0.0.1/'
        ];
        invalid.forEach(function(url) {
            try {
                Validator.check(url, 'Invalid').isUrl();
                assert.ok(false, 'Invalid url ('+url+') passed validation');
            } catch(e) {
                assert.equal('Invalid', e);
            }
        });
        
        //Now try some valid ones
        var valid = [
            'foobar.com',
            'www.foobar.com',
            'foobar.com/',
            'valid.au',
            'http://www.foobar.com/',
            'https://www.foobar.com/',
            'ftp://www.foobar.com/',
            'http://www.foobar.com/~foobar',
            'http://user:pass@www.foobar.com/',
            'http://127.0.0.1/',
            'http://255.255.255.255/'
        ];
        try {
            valid.forEach(function(url) {
                Validator.check(url).isUrl();
            });
        } catch(e) {
            assert.ok(false, 'A valid url did not pass validation');
        }
    },
    
    'test #isIP()': function(assert) {
        //Try some invalid IPs
        var invalid = [
            'abc',
            '256.0.0.0',
            '0.0.0.256'
        ];
        invalid.forEach(function(ip) {
            try {
                Validator.check(ip, 'Invalid').isIP();
                assert.ok(false, 'Invalid IP ('+ip+') passed validation');
            } catch(e) {
                assert.equal('Invalid', e);
            }
        });
        
        //Now try some valid ones
        var valid = [
            '127.0.0.1',
            '0.0.0.0',
            '255.255.255.255',
            '1.2.3.4'
        ];
        try {
            valid.forEach(function(ip) {
                Validator.check(ip).isIP();
            });
        } catch(e) {
            assert.ok(false, 'A valid IP did not pass validation');
        }
    },
    
    'test #isAlpha()': function(assert) {
        assert.ok(Validator.check('abc').isAlpha());
        assert.ok(Validator.check('ABC').isAlpha());
        assert.ok(Validator.check('FoObAr').isAlpha());
        
        ['123',123,'abc123','  ',''].forEach(function(str) {
            try {
                Validator.check(str).isAlpha();
                assert.ok(false, 'isAlpha failed');
            } catch (e) {}
        });
    },
    
    'test #isAlphanumeric()': function(assert) {
        assert.ok(Validator.check('abc13').isAlphanumeric());
        assert.ok(Validator.check('123').isAlphanumeric());
        assert.ok(Validator.check('F1oO3bAr').isAlphanumeric());
        
        ['(*&ASD','  ','.',''].forEach(function(str) {
            try {
                Validator.check(str).isAlphanumeric();
                assert.ok(false, 'isAlphanumeric failed');
            } catch (e) {}
        });
    },
    
    'test #isNumeric()': function(assert) {
        assert.ok(Validator.check('123').isNumeric());
        assert.ok(Validator.check('00123').isNumeric());
        assert.ok(Validator.check('-00123').isNumeric());
        assert.ok(Validator.check('0').isNumeric());
        assert.ok(Validator.check('-0').isNumeric());
        
        ['123.123','  ','.',''].forEach(function(str) {
            try {
                Validator.check(str).isNumeric();
                assert.ok(false, 'isNumeric failed');
            } catch (e) {}
        });
    },
    
    'test #isLowercase()': function(assert) {
        assert.ok(Validator.check('abc').isLowercase());
        assert.ok(Validator.check('foobar').isLowercase());
        assert.ok(Validator.check('a').isLowercase());
        assert.ok(Validator.check('123').isLowercase());
        assert.ok(Validator.check('abc123').isLowercase());
        
        ['123A','ABC','.',''].forEach(function(str) {
            try {
                Validator.check(str).isLowercase();
                assert.ok(false, 'isLowercase failed');
            } catch (e) {}
        });
    },
    
    'test #isUppercase()': function(assert) {
        assert.ok(Validator.check('FOOBAR').isUppercase());
        assert.ok(Validator.check('A').isUppercase());
        assert.ok(Validator.check('123').isUppercase());
        assert.ok(Validator.check('ABC123').isUppercase());
        
        ['abc','123aBC','.',''].forEach(function(str) {
            try {
                Validator.check(str).isUppercase();
                assert.ok(false, 'isUpper failed');
            } catch (e) {}
        });
    },
    
    'test #isInt()': function(assert) {        
        assert.ok(Validator.check('13').isInt());
        assert.ok(Validator.check('123').isInt());
        assert.ok(Validator.check('0').isInt());
        assert.ok(Validator.check('-0').isInt());
        
        ['123.123','01','000','  ',''].forEach(function(str) {
            try {
                Validator.check(str).isInt();
                assert.ok(false, 'isInt failed');
            } catch (e) {}
        });
    },
    
    'test #isDecimal()': function(assert) {          
        assert.ok(Validator.check('123').isDecimal());
        assert.ok(Validator.check('123.').isDecimal());
        assert.ok(Validator.check('123.123').isDecimal());
        assert.ok(Validator.check('-123.123').isDecimal());
        assert.ok(Validator.check('0.123').isDecimal());
        assert.ok(Validator.check('.123').isDecimal());
        assert.ok(Validator.check('.0').isDecimal());
        assert.ok(Validator.check('0').isDecimal());
        assert.ok(Validator.check('-0').isDecimal());
        
        ['-.123','01.123','  ',''].forEach(function(str) {
            try {
                Validator.check(str).isDecimal();
                assert.ok(false, 'isDecimal failed');
            } catch (e) {}
        });
    },
    
    //Alias for isDecimal()
    'test #isFloat()': function(assert) {          
        assert.ok(Validator.check('0.5').isFloat());
    },
    
    'test #isNull()': function(assert) {          
        assert.ok(Validator.check('').isNull());
        assert.ok(Validator.check().isNull());
        
        ['  ','123','abc'].forEach(function(str) {
            try {
                Validator.check(str).isNull();
                assert.ok(false, 'isNull failed');
            } catch (e) {}
        });
    },
    
    'test #notNull()': function(assert) {          
        assert.ok(Validator.check('abc').notNull());
        assert.ok(Validator.check('123').notNull());
        assert.ok(Validator.check('   ').notNull());
        
        [false,''].forEach(function(str) {
            try {
                Validator.check(str).notNull();
                assert.ok(false, 'notNull failed');
            } catch (e) {}
        });
    },
    
    'test #notEmpty()': function(assert) {          
        assert.ok(Validator.check('abc').notEmpty());
        assert.ok(Validator.check('123').notEmpty());
        assert.ok(Validator.check('   123   ').notEmpty());
        
        [false,'  ','\r\n','	',''].forEach(function(str) {
            try {
                Validator.check(str).notEmpty();
                assert.ok(false, 'notEmpty failed');
            } catch (e) {}
        });
    },
    
    'test #equals()': function(assert) {          
        assert.ok(Validator.check('abc').equals('abc'));
        assert.ok(Validator.check('123').equals(123));
        assert.ok(Validator.check('   ').equals('   '));
        assert.ok(Validator.check().equals(''));
        
        try {
            Validator.check(123).equals('abc');
            assert.ok(false, 'equals failed');
        } catch (e) {}
        
        try {
            Validator.check('').equals('   ');
            assert.ok(false, 'equals failed');
        } catch (e) {}
    },
    
    'test #contains()': function(assert) {          
        assert.ok(Validator.check('abc').contains('abc'));
        assert.ok(Validator.check('foobar').contains('oo'));
        assert.ok(Validator.check('abc').contains('a'));
        assert.ok(Validator.check('  ').contains(' '));
        assert.ok(Validator.check('abc').contains(''));
        
        try {
            Validator.check(123).contains('abc');
            assert.ok(false, 'contains failed');
        } catch (e) {}
        
        try {
            Validator.check('\t').contains('\t\t');
            assert.ok(false, 'contains failed');
        } catch (e) {}
    },
    
    'test #notContains()': function(assert) {          
        assert.ok(Validator.check('abc').notContains('a '));
        assert.ok(Validator.check('foobar').notContains('foobars'));
        assert.ok(Validator.check('abc').notContains('123'));
        
        try {
            Validator.check(123).notContains(1);
            assert.ok(false, 'notContains failed');
        } catch (e) {}
        
        try {
            Validator.check(' ').contains('');
            assert.ok(false, 'notContains failed');
        } catch (e) {}
    },
    
    'test #regex()': function(assert) {          
        assert.ok(Validator.check('abc').regex(/a/));
        assert.ok(Validator.check('abc').regex(/^abc$/));
        assert.ok(Validator.check('abc').regex('abc'));
        assert.ok(Validator.check('ABC').regex(/^abc$/i));
        assert.ok(Validator.check('ABC').regex('abc', 'i'));
        assert.ok(Validator.check(12390947686129).regex(/^[0-9]+$/));
        
        //Check the is() alias
        assert.ok(Validator.check(12390947686129).is(/^[0-9]+$/));
        
        try {
            Validator.check(123).regex(/^1234$/);
            assert.ok(false, 'regex failed');
        } catch (e) {}
    },
    
    'test #notRegex()': function(assert) {          
        assert.ok(Validator.check('foobar').notRegex(/e/));
        assert.ok(Validator.check('ABC').notRegex('abc'));
        assert.ok(Validator.check(12390947686129).notRegex(/a/));
        
        //Check the not() alias
        assert.ok(Validator.check(12390947686129).not(/^[a-z]+$/));
        
        try {
            Validator.check(123).notRegex(/123/);
            assert.ok(false, 'regex failed');
        } catch (e) {}
    },
    
    'test #len()': function(assert) {             
        assert.ok(Validator.check('a').len(1)); 
        assert.ok(Validator.check(123).len(2));
        assert.ok(Validator.check(123).len(2, 4));
        assert.ok(Validator.check(12).len(2,2));
        
        try {
            Validator.check('abc').len(4);
            assert.ok(false, 'len failed');
        } catch (e) {}
        try {
            Validator.check('abcd').len(1, 3);
            assert.ok(false, 'len failed');
        } catch (e) {}
    }
}

