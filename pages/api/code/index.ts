import { exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

const LANGUAGE_DOCKERFILES = {
    python: 'dockerfiles/python.Dockerfile',
    javascript: 'dockerfiles/javascript.Dockerfile',
    java: 'dockerfiles/java.Dockerfile',
    ruby: 'dockerfiles/ruby.Dockerfile',
    cpp: 'dockerfiles/cpp.Dockerfile',
    c: 'dockerfiles/c.Dockerfile',
    csharp: 'dockerfiles/csharp.Dockerfile',
    php: 'dockerfiles/php.Dockerfile',
    go: 'dockerfiles/go.Dockerfile',
    rust: 'dockerfiles/rust.Dockerfile',
    perl: 'dockerfiles/perl.Dockerfile',
    r: 'dockerfiles/r.Dockerfile',
    haskell: 'dockerfiles/haskell.Dockerfile',
    // Add more as needed
};

const languageExtensions = {
    python: 'py',
    javascript: 'js',
    java: 'java',
    ruby: 'rb',
    cpp: 'cpp',
    c: 'c',
    csharp: 'cs',
    php: 'php',
    go: 'go',
    rust: 'rs',
    swift: 'swift',
    perl: 'pl',
    lua: 'lua',
    r: 'r',
    haskell: 'hs',
    // Add other languages as necessary
};

const LANGUAGE_COMMANDS = {
    python: "python3 /app/code.py",
    javascript: "node /app/code.js",
    java: "javac /app/code.java && java -cp /app Code",
    ruby: "ruby /app/code.rb",
    cpp: "g++ /app/code.cpp -o /app/code && /app/code",
    c: "gcc /app/code.c -o /app/code && /app/code",
    csharp: "mcs /app/code.cs -out:/app/code.exe && mono /app/code.exe",
    php: "php /app/code.php",
    go: "go run /app/code.go",
    rust: "rustc /app/code.rs -o /app/code && /app/code",
    swift: "swift /app/code.swift",
    perl: "perl /app/code.pl",
    lua: "lua /app/code.lua",
    r: "Rscript /app/code.r",
    haskell: "ghc -o /app/code /app/code.hs && /app/code",
    // Add other languages as necessary
};

interface LanguageCommands {
    [key: string]: string;
}

interface LanguageExtensions {
    [key: string]: string;
}

interface LanguageDockerfiles {
    [key: string]: string;
}

function extractJavaClassName(code: string): string {
    const match = code.match(/public\s+class\s+(\w+)/);
    return match ? match[1] : 'Main';
}

interface HandlerRequest {
    method: string;
    body: {
        code: string;
        input?: string;
        language: keyof typeof LANGUAGE_COMMANDS;
    };
}

interface HandlerResponse {
    status: (code: number) => HandlerResponse;
    json: (body: any) => void;
}

export default async function handler(req: HandlerRequest, res: HandlerResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { code, input, language } = req.body;
    if (!code || !language || !LANGUAGE_COMMANDS[language]) {
        return res.status(400).json({ error: 'Code and a valid language are required' });
    }

    const uniqueId = Date.now();

    // Ensure the language has a defined extension
    const fileExtension = languageExtensions[language];
    if (!fileExtension) {
        return res.status(400).json({ error: 'Unsupported language specified' });
    }

    let inputExists = false;

    // Define file paths with appropriate extensions
    let codeFilePath: string = '';
    const inputFilePath = path.join(process.cwd(), '/tmp', `input-${uniqueId}.txt`);
    const outputFilePath = path.join(process.cwd(), '/tmp', `output-${uniqueId}.txt`);
    const errorFilePath = path.join(process.cwd(), '/tmp', `error-${uniqueId}.txt`);
    const containerName = `code-runner-${uniqueId}`;
    // console.log('containerName', containerName);

    let runCommand: string;

    try {
        // Special handling for Java
        if (language === 'java') {
            const className = extractJavaClassName(code);
            codeFilePath = path.join(process.cwd(), '/tmp', `${className}.java`);
            runCommand = `javac /app/${className}.java && java -cp /app ${className}`;
        } else {
            codeFilePath = path.join(process.cwd(), '/tmp', `code-${uniqueId}.${fileExtension}`);
            runCommand = LANGUAGE_COMMANDS[language];
        }

        // Write the code to a temporary file
        await fs.writeFile(codeFilePath, code, 'utf8');

        // Write the input to a temporary file if it exists
        if (input) {
            await fs.writeFile(inputFilePath, input, 'utf8');
            inputExists = true;
        }

        await fs.writeFile(outputFilePath, '', 'utf8');
        await fs.writeFile(errorFilePath, '', 'utf8');

        // Construct the Docker command
        const dockerCommand = inputExists
            ? `docker run --rm --name ${containerName} --memory="256m" --memory-swap="256m" --cpus="1"  --ulimit nproc=50 -v ${codeFilePath}:/app/code.${fileExtension} -v ${inputFilePath}:/app/input.txt -v ${outputFilePath}:/app/output.txt -v ${errorFilePath}:/app/error.txt code-runner-${language} bash -c "${runCommand} < /app/input.txt > /app/output.txt 2> /app/error.txt"`
            : `docker run --rm --name ${containerName} --memory="256m" --memory-swap="256m" --cpus="1"  --ulimit nproc=50 -v ${codeFilePath}:/app/code.${fileExtension} -v ${outputFilePath}:/app/output.txt -v ${errorFilePath}:/app/error.txt code-runner-${language} bash -c "${runCommand} > /app/output.txt 2> /app/error.txt"`;

        // Execute the Docker command, setting a timeout of 10 seconds, if the command takes longer than 10 seconds kill the container
        await execAsync(dockerCommand, { timeout: 10000 });

        // Read and return the output and error files
        let stdout = await fs.readFile(outputFilePath, 'utf8');
        let stderr = await fs.readFile(errorFilePath, 'utf8');
        const exitCode = stderr ? 1 : 0;

        // limit the output to 1MB for both stdout and stderr
        if (stdout.length > 1024 * 1024) {
            // have the last 1MB of the output
            stdout = stdout.slice(-1024 * 1024);
        }
        if (stderr.length > 1024 * 1024) {
            // have the last 1MB of the output
            stderr = stderr.slice(-1024 * 1024);
        }

        return res.status(200).json({ stdout, stderr, exitCode });
    } catch (error) {
        // console.error('Error1111:', error);
        // kill running processes in the container by first getting top number 2 process id and then killing it
        // const topCommand = `docker top ${containerName}`;
        // const { stdout: topOutput } = await execAsync(topCommand);
        // console.log('topOutput', topOutput);
        // const topProcessId = topOutput.split('\n')[2];
        // topProccessId in form "root                14212               14186               10                  03:35               ?                   00:00:00            python3 /app/code.py" ge the process id which is the second column
        // const id = topProcessId.split(/\s+/)[1];
        // console.log('topProcessId', id);
        // if (id) {
            // await execAsync(`docker exec ${containerName} kill -9 ${id}`);
        // }
        // check if the container is still running and kill it
        let killed = false;
        const { stdout: psOutput } = await execAsync(`docker ps -q --filter "name=${containerName}"`);
        // console.log('psOutput', psOutput);
        if (psOutput) {
            // console.log('killing container');
            await execAsync(`docker kill ${containerName}`);
            killed = true;
        }
        // await execAsync(`docker kill ${containerName}`);

        let stdout = await fs.readFile(outputFilePath, 'utf8');
        let stderr = await fs.readFile(errorFilePath, 'utf8');
        if (error instanceof Error && 'stderr' in error) {
            stderr += (error as any).stderr;
        }
        const exitCode = 1;

        if (killed) {
            // add timeout error message to the end of stderr
            stderr += '\nExecution timed out';
        }

        // limit the output to 1MB for both stdout and stderr
        if (stdout.length > 1024 * 1024) {
            // have the last 1MB of the output
            stdout = stdout.slice(-1024 * 1024);
        }
        if (stderr.length > 1024 * 1024) {
            // have the last 1MB of the output
            stderr = stderr.slice(-1024 * 1024);
        }

        return res.status(400).json({ stdout, stderr, exitCode });
    } finally {
        // Clean up temporary files
        if (codeFilePath) {
            await fs.unlink(codeFilePath);
        }
        if (inputExists) {
            await fs.unlink(inputFilePath);
        }
        await fs.unlink(outputFilePath);
        await fs.unlink(errorFilePath);
    }
}
