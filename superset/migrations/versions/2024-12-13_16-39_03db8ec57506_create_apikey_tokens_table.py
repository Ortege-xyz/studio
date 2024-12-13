# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.
"""Create apikey_tokens table

Revision ID: 03db8ec57506
Revises: 48cbb571fa3a
Create Date: 2024-12-13 16:39:44.000599

"""

# revision identifiers, used by Alembic.
revision = '03db8ec57506'
down_revision = '48cbb571fa3a'

from alembic import op
import sqlalchemy as sa


def upgrade():
     op.create_table(
        'apikey_tokens',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('ab_user.id'), nullable=False),
        sa.Column('token', sa.String(2000), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
    )


def downgrade():
    op.drop_table("apikey_tokens")
