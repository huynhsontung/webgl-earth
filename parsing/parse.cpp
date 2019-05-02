#include <string>
#include <fstream>
#include <vector>

using namespace std;
int main(int argc, char const *argv[])
{
    vector<int> vertices, normals, txCoords;
    string input;
    ifstream infile("toBeParsed.txt");
    ifstream infile2("toBeParsed-Tri.txt");

    int count = 0;
    while (!infile.eof()){
        infile >> input; 
        int slashInd = input.find('/');
        int vertex = stoi(input.substr(0, slashInd));
        input = input.erase(0, slashInd + 1);

        slashInd = input.find('/');
        int textureCoord = stoi(input.substr(0, slashInd));
        input = input.erase(0, slashInd + 1);

        int normal = stoi(input);

        vertices.push_back(vertex);
        txCoords.push_back(textureCoord);
        normals.push_back(normal);
        
        count++;
        if ((count + 1) % 4 == 0){
            vertices.push_back(vertices[vertices.size()-3]);
            txCoords.push_back(txCoords[txCoords.size()-3]);
            normals.push_back(normals[normals.size()-3]);

            vertices.push_back(vertices[vertices.size()-2]);
            txCoords.push_back(txCoords[txCoords.size()-2]);
            normals.push_back(normals[normals.size()-2]);
        }
    }

    while (!infile2.eof()){
        infile2 >> input; 
        int slashInd = input.find('/');
        int vertex = stoi(input.substr(0, slashInd));
        input = input.erase(0, slashInd + 1);

        slashInd = input.find('/');
        int textureCoord = stoi(input.substr(0, slashInd));
        input = input.erase(0, slashInd + 1);

        int normal = stoi(input);

        vertices.push_back(vertex);
        txCoords.push_back(textureCoord);
        normals.push_back(normal);
        
        count++;
    }


    vector<string> oldVertices;
    vector<string> oldNormals;
    // vector<string> refTxCoords;
    int txCoordsSize = 0;
    ifstream inVerticies("vertices.txt");
    ifstream inNormals("normals.txt");
    ifstream inTxCoords("txCoords.txt");

    while(!inVerticies.eof()){
        string value;
        inVerticies >> value;
        oldVertices.push_back(value);
    }
    while(!inNormals.eof()){
        string value;
        inNormals >> value;
        oldNormals.push_back(value);
    }
    while(!inTxCoords.eof()){
        string value;
        inTxCoords >> value;
        txCoordsSize++;
    }

    // translation
    vector<string> nVertices(txCoordsSize, "0"); // texture's size
    vector<string> nNormals(txCoordsSize, "0");  // texture's size

    for(int i = 0; i < txCoords.size(); i++){
        int ref = txCoords[i] - 1;
        int targetV = vertices[i] -1;
        int targetN = normals[i] -1;

        // if(nVertices[ref*3].compare("0") != 0 || nNormals[ref*3].compare("0") != 0){ throw "overlapping indices\n";}
        nVertices[ref*3] = oldVertices[targetV*3];
        nVertices[ref*3 + 1] = oldVertices[targetV*3 + 1];
        nVertices[ref*3 + 2] = oldVertices[targetV*3 + 2];

        nNormals[ref*3] = oldNormals[targetN*3];
        nNormals[ref*3 + 1] = oldNormals[targetN*3 + 1];
        nNormals[ref*3 + 2] = oldNormals[targetN*3 + 2];

    }
    

    ofstream outfile("faceIndex.txt");

    for (int i =0; i < txCoords.size(); i++){
        outfile << txCoords[i] << ", ";
        if ((i + 1) % 3 == 0){
            outfile << endl;
        }
    }

    outfile << endl;

    ofstream outfile1("newVertices.txt");

    for (int i =0; i < nVertices.size(); i++){
        outfile1 << nVertices[i] << ", ";
        if ((i + 1) % 3 == 0){
            outfile1 << endl;
        }
    }
    outfile1 << endl;

    ofstream outfile2("newNormals.txt");

    for (int i =0; i < nNormals.size(); i++){
        outfile2 << nNormals[i] << ", ";
        if ((i + 1) % 3 == 0){
            outfile2 << endl;
        }
    }

    outfile2 << endl;

    outfile.close();
    outfile1.close();
    outfile2.close();
    return 0;
}
