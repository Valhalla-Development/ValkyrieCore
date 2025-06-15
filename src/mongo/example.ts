import { Schema, model } from 'mongoose';

/**
 * Represents a schema for storing the Logging module state data
 */
const Example = new Schema({
    GuildId: { type: String, unique: true },
    ChannelId: { type: String, default: null },
});

export default model('Example', Example, 'Example');
