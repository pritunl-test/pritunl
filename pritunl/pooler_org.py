from pritunl.constants import *
from pritunl.exceptions import *
from pritunl.descriptors import *
from pritunl.cache import cache_db
from pritunl.least_common_counter import LeastCommonCounter
from pritunl import app_server
import pritunl.mongo as mongo
import pritunl.utils as utils
import logging
import time
import threading
import uuid
import subprocess
import os
import itertools
import collections

logger = logging.getLogger(APP_NAME)

class PoolerOrg(object):
    @cached_static_property
    def collection(cls):
        return mongo.get_collection('organizations')

    @classmethod
    def fill_pool(cls):
        from pritunl.organization import Organization

        org_pool_count = mongo.get_collection('organizations').find({
            'type': ORG_POOL,
        }, {
            '_id': True,
        }).count()

        for _ in xrange(ORG_POOL_SIZE - org_pool_count):
            org = Organization.new_org(type=ORG_POOL)
            org.commit()